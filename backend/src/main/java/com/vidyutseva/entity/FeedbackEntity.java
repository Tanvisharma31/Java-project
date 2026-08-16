package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long feedbackId;
    
    @Column(name = "feedback_number", unique = true, nullable = false, length = 20)
    private String feedbackNumber;
    
    @Column(name = "consumer_id", length = 13)
    private String consumerId;
    
    @Column(name = "staff_id", length = 20)
    private String staffId;
    
    @Column(name = "type", nullable = false, length = 50)
    private String type;
    
    @Column(name = "category", nullable = false, length = 50)
    private String category;
    
    @Column(name = "subject", nullable = false, length = 100)
    private String subject;
    
    @Column(name = "details", nullable = false, columnDefinition = "TEXT")
    private String details;
    
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    @Column(name = "contact_info", length = 255)
    private String contactInfo;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FeedbackStatus status;
    
    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;
    
    @Column(name = "admin_id")
    private Long adminId;
    
    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = FeedbackStatus.SUBMITTED;
        }
    }
    
    public enum FeedbackStatus {
        SUBMITTED,
        UNDER_REVIEW,
        ACKNOWLEDGED,
        RESOLVED
    }
}