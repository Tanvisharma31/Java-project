package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerEntity {

    @Id
    @Column(name = "consumer_id", length = 13, nullable = false)
    private String consumerId;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(unique = true, nullable = false, length = 15)
    private String mobile;

    @Column(nullable = false, length = 30)
    private String password;

    @Column(nullable = false, length = 10)
    private String title; // Mr, Mrs, Ms, Dr

    @Column(name = "user_id", nullable = false, length = 20)
    private String userId;

    @Column(nullable = false, length = 20)
    private String status; // Active, Inactive, Deactivated

    @Column(name = "address_area", nullable = false, length = 100)
    private String addressArea;

    @Column(name = "connection_type", nullable = false, length = 20)
    private String connectionType; // RESIDENTIAL, COMMERCIAL

    @Column(name = "sanctioned_load_kw", nullable = false, precision = 6, scale = 2)
    private BigDecimal sanctionedLoadKw;

    @Column(name = "previous_meter_reading", nullable = false)
    private Integer previousMeterReading;

    @Column(name = "deactivation_reason")
    private String deactivationReason;

    @Column(name = "city")
    private String city;

    @Column(name = "pincode")
    private String pincode;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
