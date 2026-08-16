package com.vidyutseva.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tariff_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TariffEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "connection_type", unique = true, nullable = false, length = 20)
    private String connectionType; // RESIDENTIAL, COMMERCIAL

    @Column(name = "fixed_charge_per_kw", nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedChargePerKw;

    @Column(name = "slab1_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab1Rate;

    @Column(name = "slab2_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab2Rate;

    @Column(name = "slab3_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab3Rate;

    @Column(name = "electricity_duty_pct", nullable = false, precision = 5, scale = 4)
    private BigDecimal electricityDutyPct;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
