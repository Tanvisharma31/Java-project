package com.vidyutseva.payment;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.*;
import com.vidyutseva.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final NotificationRepository notificationRepository;

    @Data
    static class CardDetails {
        private String cardNumber; // must NOT be persisted in full
        private String cardHolderName;
        private String expiryDate;
        private String cvv; // must NEVER be persisted
    }

    @Data
    static class PaymentRequest {
        @NotEmpty(message = "At least one bill must be selected")
        private List<String> billIds;

        @NotBlank(message = "Consumer ID is required")
        private String consumerId;

        @NotNull(message = "Total amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be positive")
        private BigDecimal totalAmount;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod; // CARD, UPI, NET_BANKING

        private CardDetails cardDetails;
        private String upiId;
        private String bankName;
    }

    // -------------------------------------------------------------------------
    // POST /customer/payments  — process payment
    // -------------------------------------------------------------------------
    @PostMapping("/customer/payments")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PaymentEntity>> processPayment(
            @Valid @RequestBody PaymentRequest req,
            Authentication auth) {

        // 1. Ownership — ensure consumer belongs to authenticated user
        CustomerEntity customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        if (!customer.getConsumerId().equals(req.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied: Consumer ID does not belong to your account"));
        }

        // 2. Fetch and validate bills
        List<BillEntity> bills = billRepository.findAllById(req.getBillIds());
        if (bills.size() != req.getBillIds().size()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("One or more bill IDs not found"));
        }

        for (BillEntity bill : bills) {
            if (!bill.getConsumerId().equals(customer.getConsumerId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Bill " + bill.getBillId() + " does not belong to your account"));
            }
            if ("PAID".equalsIgnoreCase(bill.getStatus())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Bill " + bill.getBillId() + " is already paid"));
            }
        }

        // 3. Amount verification (backend recalculates payable)
        BigDecimal backendTotal = bills.stream()
                .map(BillEntity::getTotalPayable)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (req.getTotalAmount().compareTo(backendTotal) != 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Payment amount ₹" + req.getTotalAmount()
                            + " does not match payable amount ₹" + backendTotal));
        }

        // 4. Payment method validation
        String method = req.getPaymentMethod().toUpperCase();
        if ("CARD".equals(method) && req.getCardDetails() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Card details required"));
        }
        if ("UPI".equals(method)) {
            if (req.getUpiId() == null || !req.getUpiId().contains("@")) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Invalid UPI ID — must contain '@'"));
            }
        }
        if ("NET_BANKING".equals(method) && (req.getBankName() == null || req.getBankName().isBlank())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Bank selection is required for Net Banking"));
        }

        // 5. Generate transaction (masked card only — never persist full card or CVV)
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        String receiptNumber  = "RCP-" + System.currentTimeMillis();

        String maskedCard = null;
        if ("CARD".equals(method) && req.getCardDetails() != null && req.getCardDetails().getCardNumber() != null) {
            String num = req.getCardDetails().getCardNumber();
            maskedCard = "****-****-****-" + (num.length() >= 4 ? num.substring(num.length() - 4) : "XXXX");
        }

        PaymentEntity payment = PaymentEntity.builder()
                .transactionId(transactionId)
                .receiptNumber(receiptNumber)
                .consumerId(customer.getConsumerId())
                .billIds(String.join(",", req.getBillIds()))
                .totalPaid(backendTotal)
                .paymentMethod(method)
                .maskedCard(maskedCard)
                .paymentDate(LocalDateTime.now())
                .status("SUCCESS")
                .build();
        paymentRepository.save(payment);

        // 6. Mark bills as PAID
        bills.forEach(b -> {
            b.setStatus("PAID");
            b.setPaymentMethod(method);
            b.setPaymentDate(LocalDate.now());
            billRepository.save(b);
        });

        // 7. Notify customer
        String billList = bills.stream().map(BillEntity::getBillId).collect(Collectors.joining(", "));
        notificationRepository.save(NotificationEntity.builder()
                .consumerId(customer.getConsumerId())
                .message("Payment successful! Transaction ID: " + transactionId
                        + ". Amount: ₹" + backendTotal + ". Bills settled: " + billList)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment successful", payment));
    }

    // -------------------------------------------------------------------------
    // GET /customer/payments/history
    // -------------------------------------------------------------------------
    @GetMapping("/customer/payments/history")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<PaymentEntity>>> getPaymentHistory(Authentication auth) {
        CustomerEntity customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        List<PaymentEntity> history = paymentRepository.findByConsumerId(customer.getConsumerId());
        return ResponseEntity.ok(ApiResponse.success("Payment history fetched", history));
    }
}
