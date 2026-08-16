package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequestEntity {

    @Id
    @Column(name = "request_id", length = 20)
    private String requestId;

    @Column(name = "consumer_id", nullable = false, length = 20)
    private String consumerId;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "request_type", nullable = false, length = 50)
    private String requestType; // LOAD_CHANGE, CATEGORY_CHANGE

    @Column(name = "current_value", length = 50)
    private String currentValue;

    @Column(name = "requested_value", length = 50)
    private String requestedValue;

    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(nullable = false, length = 20)
    private String status; // PENDING, APPROVED, REJECTED

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "actioned_at")
    private LocalDateTime actionedAt;
}
