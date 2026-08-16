package com.vidyutseva.servicerequest;

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
public class ServiceRequestController {

    private final ServiceRequestRepository srRepository;
    private final CustomerRepository customerRepository;
    private final NotificationRepository notificationRepository;

    @Data
    static class ServiceRequestBody {
        @NotBlank private String consumerId;
        @NotBlank private String requestType; // LOAD_CHANGE, CATEGORY_CHANGE
        private String currentValue;
        @NotBlank private String requestedValue;
        @NotBlank @Size(min = 10, max = 500) private String reason;
        private String customerName;
    }

    // -------------------------------------------------------------------------
    // POST /customer/service-requests
    // -------------------------------------------------------------------------
    @PostMapping("/customer/service-requests")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ServiceRequestEntity>> createRequest(
            @Valid @RequestBody ServiceRequestBody req,
            Authentication auth) {

        CustomerEntity customer = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        if (!customer.getConsumerId().equals(req.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Consumer ID does not belong to your account"));
        }

        long count = srRepository.count() + 1;
        String requestId = String.format("SR-%d-%06d", LocalDateTime.now().getYear(), count);

        ServiceRequestEntity sr = ServiceRequestEntity.builder()
                .requestId(requestId)
                .consumerId(customer.getConsumerId())
                .customerName(customer.getName())
                .requestType(req.getRequestType())
                .currentValue(req.getCurrentValue())
                .requestedValue(req.getRequestedValue())
                .reason(req.getReason())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        srRepository.save(sr);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service request submitted", sr));
    }

    // -------------------------------------------------------------------------
    // GET /customer/service-requests
    // -------------------------------------------------------------------------
    @GetMapping("/customer/service-requests")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ServiceRequestEntity>>> getMyRequests(Authentication auth) {
        CustomerEntity c = customerRepository.findByUserId(auth.getName())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        return ResponseEntity.ok(ApiResponse.success("Service requests fetched",
                srRepository.findByConsumerId(c.getConsumerId())));
    }

    // -------------------------------------------------------------------------
    // GET /admin/service-requests
    // -------------------------------------------------------------------------
    @GetMapping("/admin/service-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ServiceRequestEntity>>> getAllRequests(
            @RequestParam(required = false) String status) {
        List<ServiceRequestEntity> list = status != null
                ? srRepository.findByStatus(status)
                : srRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Requests fetched", list));
    }

    // -------------------------------------------------------------------------
    // PATCH /admin/service-requests/{requestId}/action
    // -------------------------------------------------------------------------
    @PatchMapping("/admin/service-requests/{requestId}/action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ServiceRequestEntity>> actionRequest(
            @PathVariable String requestId,
            @RequestBody Map<String, String> body) {

        ServiceRequestEntity sr = srRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Service request not found: " + requestId));

        String action  = body.getOrDefault("status", "APPROVED"); // APPROVED or REJECTED
        String remarks = body.getOrDefault("remarks", "");
        sr.setStatus(action);
        sr.setRemarks(remarks);
        sr.setActionedAt(LocalDateTime.now());
        srRepository.save(sr);

        // Notify customer
        notificationRepository.save(NotificationEntity.builder()
                .consumerId(sr.getConsumerId())
                .message("Your service request " + requestId + " (" + sr.getRequestType()
                        + ") has been " + action + ". Remarks: " + (remarks.isBlank() ? "N/A" : remarks))
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(ApiResponse.success("Service request " + action.toLowerCase(), sr));
    }
}
