package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffEntity {

    @Id
    @Column(name = "staff_id", length = 20)
    private String staffId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "area_assigned", nullable = false, length = 100)
    private String areaAssigned;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "Active";

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
