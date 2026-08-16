package com.vidyutseva.meterreading;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.*;
import com.vidyutseva.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MeterReadingController {

    private final CustomerRepository customerRepository;
    private final BillRepository billRepository;
    private final TariffRepository tariffRepository;
    private final NotificationRepository notificationRepository;
    private final StaffRepository staffRepository;

    @Data
    static class MeterReadingRequest {
        @NotBlank(message = "Consumer ID is required")
        @Pattern(regexp = "^[0-9]{13}$", message = "Consumer ID must be exactly 13 digits")
        private String consumerId;

        @NotNull(message = "Current reading is required")
        @Min(value = 0, message = "Current reading cannot be negative")
        private Integer currentReading;

        @NotBlank(message = "Reading date is required")
        private String readingDate;

        private String staffId;
        private String staffArea;
    }

    @Data
    static class MeterReadingResponse {
        private BillEntity bill;
        private String message;
    }

    // -------------------------------------------------------------------------
    // POST /meter-readings  — staff submits reading → generates bill
    // -------------------------------------------------------------------------
    @PostMapping("/meter-readings")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<MeterReadingResponse>> submitReading(
            @Valid @RequestBody MeterReadingRequest req,
            Authentication auth) {

        // 1. Validate Staff exists and get their area
        String staffId = auth.getName();
        StaffEntity staff = staffRepository.findByStaffId(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff account not found"));

        // 2. Validate Customer
        CustomerEntity customer = customerRepository.findByConsumerId(req.getConsumerId()).orElse(null);
        if (customer == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Consumer ID " + req.getConsumerId() + " not found in system"));
        }

        // 3. Area mismatch enforcement
        if (!staff.getAreaAssigned().equalsIgnoreCase(customer.getAddressArea())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Consumer area '" + customer.getAddressArea()
                            + "' does not match your assigned area '" + staff.getAreaAssigned() + "'"));
        }

        // 4. Reading validation
        int prevReading = customer.getPreviousMeterReading();
        if (req.getCurrentReading() < prevReading) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid meter reading: Current reading ("
                            + req.getCurrentReading() + ") cannot be less than previous reading (" + prevReading + ")"));
        }

        // 5. Duplicate billing-cycle prevention (same billing month)
        String billingMonth = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
        if (billRepository.existsByConsumerIdAndBillingMonth(customer.getConsumerId(), billingMonth)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("A bill for " + billingMonth + " has already been generated for this consumer"));
        }

        // 6. Bill Engine — calculate charges
        int unitsConsumed = req.getCurrentReading() - prevReading;
        TariffEntity tariff = tariffRepository.findByConnectionType(customer.getConnectionType())
                .orElseThrow(() -> new IllegalArgumentException("No tariff configured for " + customer.getConnectionType()));

        BigDecimal energyCharge = calculateEnergyCharge(unitsConsumed, tariff);
        BigDecimal fixedCharge  = tariff.getFixedChargePerKw().multiply(customer.getSanctionedLoadKw());
        BigDecimal baseAmount   = energyCharge.add(fixedCharge);
        BigDecimal tax          = baseAmount.multiply(tariff.getElectricityDutyPct());
        BigDecimal totalAmount  = baseAmount.add(tax);

        LocalDate billDate = LocalDate.now();
        LocalDate dueDate  = billDate.plusDays(15);

        String billId = "BILL-" + System.currentTimeMillis();

        BillEntity bill = BillEntity.builder()
                .billId(billId)
                .consumerId(customer.getConsumerId())
                .previousReading(prevReading)
                .currentReading(req.getCurrentReading())
                .unitsConsumed(unitsConsumed)
                .amount(totalAmount.setScale(2, java.math.RoundingMode.HALF_UP))
                .lateFee(BigDecimal.ZERO)
                .totalPayable(totalAmount.setScale(2, java.math.RoundingMode.HALF_UP))
                .billingMonth(billingMonth)
                .billDate(billDate)
                .dueDate(dueDate)
                .status("PENDING")
                .paymentMethod("N/A")
                .isOverdue15Days(false)
                .build();

        billRepository.save(bill);

        // 7. Update customer's previous reading
        customer.setPreviousMeterReading(req.getCurrentReading());
        customerRepository.save(customer);

        // 8. Notify customer
        NotificationEntity notif = NotificationEntity.builder()
                .consumerId(customer.getConsumerId())
                .message("Your electricity bill for " + billingMonth + " has been generated. Amount: ₹"
                        + totalAmount.setScale(2, java.math.RoundingMode.HALF_UP) + ". Due date: " + dueDate)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notif);

        MeterReadingResponse resp = new MeterReadingResponse();
        resp.setBill(bill);
        resp.setMessage("Bill generated successfully for Consumer " + customer.getConsumerId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Bill generated", resp));
    }

    // -------------------------------------------------------------------------
    // Slab-based energy charge calculation
    // -------------------------------------------------------------------------
    private BigDecimal calculateEnergyCharge(int units, TariffEntity tariff) {
        BigDecimal charge = BigDecimal.ZERO;
        if (units <= 0) return charge;

        if (units <= 100) {
            charge = tariff.getSlab1Rate().multiply(BigDecimal.valueOf(units));
        } else if (units <= 300) {
            charge = tariff.getSlab1Rate().multiply(BigDecimal.valueOf(100))
                    .add(tariff.getSlab2Rate().multiply(BigDecimal.valueOf(units - 100)));
        } else {
            charge = tariff.getSlab1Rate().multiply(BigDecimal.valueOf(100))
                    .add(tariff.getSlab2Rate().multiply(BigDecimal.valueOf(200)))
                    .add(tariff.getSlab3Rate().multiply(BigDecimal.valueOf(units - 300)));
        }
        return charge;
    }
}
