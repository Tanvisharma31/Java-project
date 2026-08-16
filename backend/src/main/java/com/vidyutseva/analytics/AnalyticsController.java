package com.vidyutseva.analytics;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.*;
import com.vidyutseva.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final BillRepository billRepository;
    private final ComplaintRepository complaintRepository;
    private final ServiceRequestRepository srRepository;
    private final PaymentRepository paymentRepository;

    @Data
    @Builder
    static class DashboardStats {
        private long totalCustomers;
        private long activeCustomers;
        private long totalStaff;
        private BigDecimal totalRevenue;
        private BigDecimal pendingDues;
        private long paidBills;
        private long pendingBills;
        private long overdueBills;
        private long activeComplaints;
        private long pendingServiceRequests;
    }

    @Data
    @Builder
    static class DefaulterRecord {
        private String consumerId;
        private String name;
        private String area;
        private BigDecimal outstandingAmount;
        private long unpaidBillsCount;
    }

    // -------------------------------------------------------------------------
    // GET /admin/analytics/dashboard
    // -------------------------------------------------------------------------
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        List<CustomerEntity> customers = customerRepository.findAll();
        List<BillEntity> bills = billRepository.findAll();
        List<PaymentEntity> payments = paymentRepository.findAll();

        BigDecimal revenue = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .map(PaymentEntity::getTotalPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingDues = bills.stream()
                .filter(b -> !"PAID".equals(b.getStatus()))
                .map(BillEntity::getTotalPayable)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        DashboardStats stats = DashboardStats.builder()
                .totalCustomers(customers.size())
                .activeCustomers(customers.stream().filter(c -> "Active".equals(c.getStatus())).count())
                .totalStaff(staffRepository.count())
                .totalRevenue(revenue)
                .pendingDues(pendingDues)
                .paidBills(bills.stream().filter(b -> "PAID".equals(b.getStatus())).count())
                .pendingBills(bills.stream().filter(b -> "PENDING".equals(b.getStatus())).count())
                .overdueBills(bills.stream().filter(b -> "OVERDUE".equals(b.getStatus())).count())
                .activeComplaints(complaintRepository.countByStatus("OPEN")
                        + complaintRepository.countByStatus("IN_PROGRESS"))
                .pendingServiceRequests(srRepository.countByStatus("PENDING"))
                .build();

        return ResponseEntity.ok(ApiResponse.success("Dashboard stats", stats));
    }

    // -------------------------------------------------------------------------
    // GET /admin/analytics/defaulters
    // -------------------------------------------------------------------------
    @GetMapping("/defaulters")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<DefaulterRecord>>> getDefaulters() {
        List<BillEntity> unpaidBills = billRepository.findByStatus("PENDING");
        unpaidBills.addAll(billRepository.findByStatus("OVERDUE"));

        // Group by consumerId
        Map<String, List<BillEntity>> grouped = unpaidBills.stream()
                .collect(Collectors.groupingBy(BillEntity::getConsumerId));

        List<DefaulterRecord> defaulters = new ArrayList<>();
        grouped.forEach((consumerId, billList) -> {
            customerRepository.findByConsumerId(consumerId).ifPresent(c -> {
                BigDecimal total = billList.stream()
                        .map(BillEntity::getTotalPayable)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                defaulters.add(DefaulterRecord.builder()
                        .consumerId(consumerId)
                        .name(c.getName())
                        .area(c.getAddressArea())
                        .outstandingAmount(total)
                        .unpaidBillsCount(billList.size())
                        .build());
            });
        });

        defaulters.sort(Comparator.comparing(DefaulterRecord::getOutstandingAmount).reversed());
        return ResponseEntity.ok(ApiResponse.success("Defaulters report", defaulters));
    }

    // -------------------------------------------------------------------------
    // GET /admin/analytics/revenue-summary
    // -------------------------------------------------------------------------
    @GetMapping("/revenue-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getRevenueSummary() {
        List<PaymentEntity> payments = paymentRepository.findAll();
        Map<String, BigDecimal> summary = new LinkedHashMap<>();
        summary.put("totalRevenue", payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()))
                .map(PaymentEntity::getTotalPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("cardRevenue", payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()) && "CARD".equals(p.getPaymentMethod()))
                .map(PaymentEntity::getTotalPaid).reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("upiRevenue", payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()) && "UPI".equals(p.getPaymentMethod()))
                .map(PaymentEntity::getTotalPaid).reduce(BigDecimal.ZERO, BigDecimal::add));
        summary.put("netBankingRevenue", payments.stream()
                .filter(p -> "SUCCESS".equals(p.getStatus()) && "NET_BANKING".equals(p.getPaymentMethod()))
                .map(PaymentEntity::getTotalPaid).reduce(BigDecimal.ZERO, BigDecimal::add));
        return ResponseEntity.ok(ApiResponse.success("Revenue summary", summary));
    }
}
