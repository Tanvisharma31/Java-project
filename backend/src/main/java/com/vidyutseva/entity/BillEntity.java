package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillEntity {

    @Id
    @Column(name = "bill_id", length = 20)
    private String billId;

    @Column(name = "consumer_id", length = 20, nullable = false)
    private String consumerId;

    @Column(name = "previous_reading", nullable = false)
    private Integer previousReading;

    @Column(name = "current_reading", nullable = false)
    private Integer currentReading;

    @Column(name = "units_consumed", nullable = false)
    private Integer unitsConsumed;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "late_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal lateFee;

    @Column(name = "total_payable", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPayable;

    @Column(name = "billing_month", length = 20)
    private String billingMonth;

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false, length = 20)
    private String status; // PENDING, PAID, OVERDUE

    @Column(name = "payment_method", length = 20)
    private String paymentMethod; // CARD, UPI, NET_BANKING, N/A

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "is_overdue_15_days")
    private Boolean isOverdue15Days = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
