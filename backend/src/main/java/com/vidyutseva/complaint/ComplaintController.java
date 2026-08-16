package com.vidyutseva.complaint;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.*;
import com.vidyutseva.repository.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final CustomerRepository customerRepository;
    private final NotificationRepository notificationRepository;

    @Data
    static class ComplaintRequest {
        @NotBlank private String consumerId;
        @NotBlank private String complaintType;
        @NotBlank private String category;
        @NotBlank @Size(min = 2, max = 100) private String contactPerson;
        private String landmark;
        @NotBlank @Pattern(regexp = "^[0-9]{10}$") private String mobile;
        @NotBlank @Size(min = 10, max = 1000) private String problemDescription;
        @NotBlank private String address;
        private String customerName;
        private String assignedArea;
    }

    // -------------------------------------------------------------------------
    // POST /customer/complaints
    // -------------------------------------------------------------------------
    @PostMapping("/customer/complaints")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ComplaintEntity>> createComplaint(
            @Valid @RequestBody ComplaintRequest req,
            Authentication auth) {

        CustomerEntity customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        // Ownership check — consumer ID must match
        if (!customer.getConsumerId().equals(req.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Consumer ID does not belong to your account"));
        }

        long count = complaintRepository.count() + 1;
        String complaintId = String.format("CMP-%d-%06d", LocalDateTime.now().getYear(), count);

        ComplaintEntity complaint = ComplaintEntity.builder()
                .complaintId(complaintId)
                .consumerId(customer.getConsumerId())
                .customerName(customer.getName())
                .complaintType(req.getComplaintType())
                .category(req.getCategory())
                .assignedArea(customer.getAddressArea())
                .description(req.getProblemDescription())
                .priority(determinePriority(req.getComplaintType()))
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build();

        complaintRepository.save(complaint);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Complaint registered", complaint));
    }

    // -------------------------------------------------------------------------
    // GET /customer/complaints
    // -------------------------------------------------------------------------
    @GetMapping("/customer/complaints")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ComplaintEntity>>> getMyComplaints(Authentication auth) {
        CustomerEntity c = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        return ResponseEntity.ok(ApiResponse.success("Complaints fetched",
                complaintRepository.findByConsumerId(c.getConsumerId())));
    }

    // -------------------------------------------------------------------------
    // GET /staff/complaints  — area-filtered for staff
    // -------------------------------------------------------------------------
    @GetMapping("/staff/complaints")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<List<ComplaintEntity>>> getAreaComplaints(
            @RequestParam(required = false) String area) {
        List<ComplaintEntity> list = area != null
                ? complaintRepository.findByAssignedArea(area)
                : complaintRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Complaints fetched", list));
    }

    // -------------------------------------------------------------------------
    // GET /admin/complaints
    // -------------------------------------------------------------------------
    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ComplaintEntity>>> getAllComplaints(
            @RequestParam(required = false) String status) {
        List<ComplaintEntity> list = status != null
                ? complaintRepository.findByStatus(status)
                : complaintRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Complaints fetched", list));
    }

    // -------------------------------------------------------------------------
    // PATCH /admin/complaints/{complaintId}/resolve
    // -------------------------------------------------------------------------
    @PatchMapping("/admin/complaints/{complaintId}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ComplaintEntity>> resolveComplaint(
            @PathVariable String complaintId,
            @RequestBody Map<String, String> body) {

        ComplaintEntity c = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));

        String newStatus = body.getOrDefault("status", "RESOLVED");
        String remarks   = body.getOrDefault("remarks", "Resolved by admin");
        c.setStatus(newStatus);
        c.setResolutionRemarks(remarks);
        c.setResolvedAt(LocalDateTime.now());
        complaintRepository.save(c);

        // Notify customer
        notificationRepository.save(NotificationEntity.builder()
                .consumerId(c.getConsumerId())
                .message("Your complaint " + complaintId + " has been " + newStatus + ". Remarks: " + remarks)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(ApiResponse.success("Complaint updated to " + newStatus, c));
    }

    private String determinePriority(String type) {
        return switch (type) {
            case "Voltage Related", "Pole Related" -> "HIGH";
            case "Billing Related", "Meter Related" -> "MEDIUM";
            default -> "LOW";
        };
    }
}
