package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "user_id", unique = true, length = 20)
    private String userId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "user_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private UserType userType; // Admin, Customer, Staff

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private UserStatus status; // Active, Inactive, Deactivated

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum UserType {
        ADMIN, CUSTOMER, STAFF
    }

    public enum UserStatus {
        ACTIVE, INACTIVE, DEACTIVATED
    }
}
