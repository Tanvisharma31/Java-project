package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintEntity {

    @Id
    @Column(name = "complaint_id", length = 20)
    private String complaintId;

    @Column(name = "consumer_id", nullable = false, length = 20)
    private String consumerId;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "complaint_type", nullable = false, length = 50)
    private String complaintType;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "assigned_area", length = 100)
    private String assignedArea;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, length = 20)
    private String priority; // LOW, MEDIUM, HIGH

    @Column(nullable = false, length = 20)
    private String status; // OPEN, IN_PROGRESS, RESOLVED, REJECTED

    @Column(name = "resolution_remarks", columnDefinition = "TEXT")
    private String resolutionRemarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
