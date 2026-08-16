package com.vidyutseva.bill;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.*;
import com.vidyutseva.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class BillController {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;

    // -------------------------------------------------------------------------
    // GET /customer/bills  — bills for authenticated customer
    // -------------------------------------------------------------------------
    @GetMapping("/customer/bills")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<BillEntity>>> getMyBills(Authentication auth) {
        CustomerEntity c = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        List<BillEntity> bills = billRepository.findByConsumerId(c.getConsumerId());
        updateOverdueStatus(bills);
        return ResponseEntity.ok(ApiResponse.success("Bills fetched", bills));
    }

    // -------------------------------------------------------------------------
    // GET /customer/bills/{billId}
    // -------------------------------------------------------------------------
    @GetMapping("/customer/bills/{billId}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<BillEntity>> getBillById(
            @PathVariable String billId, Authentication auth) {

        CustomerEntity c = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        BillEntity bill = billRepository.findById(billId)
                .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));

        if (!bill.getConsumerId().equals(c.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied to this bill"));
        }
        return ResponseEntity.ok(ApiResponse.success("Bill fetched", bill));
    }

    // -------------------------------------------------------------------------
    // ADMIN: GET /admin/bills
    // -------------------------------------------------------------------------
    @GetMapping("/admin/bills")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BillEntity>>> getAllBills() {
        List<BillEntity> bills = billRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Bills fetched", bills));
    }

    // -------------------------------------------------------------------------
    // Overdue calculation: >15 days past due → OVERDUE + late fee
    // -------------------------------------------------------------------------
    private void updateOverdueStatus(List<BillEntity> bills) {
        LocalDate now = LocalDate.now();
        for (BillEntity bill : bills) {
            if ("PAID".equals(bill.getStatus())) continue;
            if (bill.getDueDate() != null && now.isAfter(bill.getDueDate().plusDays(15))) {
                bill.setStatus("OVERDUE");
                bill.setIsOverdue15Days(true);
                if (bill.getLateFee().compareTo(BigDecimal.ZERO) == 0) {
                    BigDecimal lateFee = bill.getAmount().multiply(BigDecimal.valueOf(0.02)); // 2% late fee
                    bill.setLateFee(lateFee);
                    bill.setTotalPayable(bill.getAmount().add(lateFee));
                    billRepository.save(bill);
                }
            } else if (bill.getDueDate() != null && now.isAfter(bill.getDueDate())) {
                bill.setStatus("OVERDUE");
            }
        }
    }
}
