package com.vidyutseva.staff;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.StaffEntity;
import com.vidyutseva.repository.StaffRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffRepository staffRepository;
    private final PasswordEncoder passwordEncoder;

    @Data
    static class AddStaffRequest {
        @NotBlank @Size(min = 3, max = 20) private String staffId;
        @NotBlank @Size(min = 2, max = 100) private String name;
        @NotBlank @Size(min = 8, max = 30)  private String password;
        @NotBlank private String areaAssigned;
    }

    // -------------------------------------------------------------------------
    // GET /admin/staff
    // -------------------------------------------------------------------------
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<StaffEntity>>> getAllStaff() {
        List<StaffEntity> list = staffRepository.findAll();
        list.forEach(s -> s.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success("Staff list fetched", list));
    }

    // -------------------------------------------------------------------------
    // POST /admin/staff
    // -------------------------------------------------------------------------
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StaffEntity>> addStaff(@Valid @RequestBody AddStaffRequest req) {
        if (staffRepository.findByStaffId(req.getStaffId()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Staff ID " + req.getStaffId() + " already exists"));
        }
        StaffEntity staff = StaffEntity.builder()
                .staffId(req.getStaffId())
                .name(req.getName())
                .password(passwordEncoder.encode(req.getPassword()))
                .areaAssigned(req.getAreaAssigned())
                .status("Active")
                .build();
        staffRepository.save(staff);
        staff.setPassword(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Staff registered", staff));
    }

    // -------------------------------------------------------------------------
    // PATCH /admin/staff/{staffId}/status
    // -------------------------------------------------------------------------
    @PatchMapping("/{staffId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StaffEntity>> toggleStatus(
            @PathVariable String staffId,
            @RequestBody Map<String, String> body) {

        StaffEntity staff = staffRepository.findByStaffId(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));
        staff.setStatus(body.getOrDefault("status", "Inactive"));
        staffRepository.save(staff);
        staff.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Staff status updated", staff));
    }

    // -------------------------------------------------------------------------
    // PATCH /admin/staff/{staffId}/area
    // -------------------------------------------------------------------------
    @PatchMapping("/{staffId}/area")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StaffEntity>> reassignArea(
            @PathVariable String staffId,
            @RequestBody Map<String, String> body) {

        StaffEntity staff = staffRepository.findByStaffId(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + staffId));
        String newArea = body.getOrDefault("areaAssigned", "");
        if (newArea.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Area cannot be empty"));
        }
        staff.setAreaAssigned(newArea);
        staffRepository.save(staff);
        staff.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Area reassigned to " + newArea, staff));
    }
}
