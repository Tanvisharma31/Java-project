package com.vidyutseva.tariff;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.TariffEntity;
import com.vidyutseva.repository.TariffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/tariffs")
@RequiredArgsConstructor
public class TariffController {

    private final TariffRepository tariffRepository;

    // -------------------------------------------------------------------------
    // GET /admin/tariffs
    // -------------------------------------------------------------------------
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TariffEntity>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Tariffs fetched", tariffRepository.findAll()));
    }

    // -------------------------------------------------------------------------
    // PUT /admin/tariffs/{id}
    // -------------------------------------------------------------------------
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TariffEntity>> update(
            @PathVariable Long id,
            @RequestBody TariffEntity updated) {

        TariffEntity existing = tariffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tariff not found: " + id));

        existing.setFixedChargePerKw(updated.getFixedChargePerKw());
        existing.setSlab1Rate(updated.getSlab1Rate());
        existing.setSlab2Rate(updated.getSlab2Rate());
        existing.setSlab3Rate(updated.getSlab3Rate());
        existing.setElectricityDutyPct(updated.getElectricityDutyPct());
        tariffRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Tariff updated", existing));
    }

    // -------------------------------------------------------------------------
    // GET /admin/tariffs/{connectionType}  — by type, accessible to staff too
    // -------------------------------------------------------------------------
    @GetMapping("/type/{connectionType}")
    public ResponseEntity<ApiResponse<TariffEntity>> getByType(@PathVariable String connectionType) {
        TariffEntity tariff = tariffRepository.findByConnectionType(connectionType.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("No tariff for: " + connectionType));
        return ResponseEntity.ok(ApiResponse.success("Tariff fetched", tariff));
    }
}
