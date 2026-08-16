package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentEntity {

    @Id
    @Column(name = "transaction_id", length = 30)
    private String transactionId;

    @Column(name = "receipt_number", unique = true, length = 30)
    private String receiptNumber;

    @Column(name = "consumer_id", nullable = false, length = 20)
    private String consumerId;

    @Column(name = "bill_ids", nullable = false, length = 255)
    private String billIds;

    @Column(name = "total_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPaid;

    @Column(name = "payment_method", nullable = false, length = 20)
    private String paymentMethod; // CARD, UPI, NET_BANKING

    @Column(name = "masked_card", length = 20)
    private String maskedCard;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Column(nullable = false, length = 20)
    private String status; // SUCCESS, FAILED
}
