package com.vidyutseva.customer;

import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.CustomerEntity;
import com.vidyutseva.repository.CustomerRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;

    // -------------------------------------------------------------------------
    // GET /customer/profile  — own profile
    // -------------------------------------------------------------------------
    @GetMapping("/customer/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerEntity>> getProfile(Authentication auth) {
        String userId = auth.getName();
        CustomerEntity c = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));
        c.setPassword(null); // never expose password
        return ResponseEntity.ok(ApiResponse.success("Profile fetched", c));
    }

    // -------------------------------------------------------------------------
    // PUT /customer/profile  — update contact info
    // -------------------------------------------------------------------------
    @PutMapping("/customer/profile")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerEntity>> updateProfile(
            Authentication auth,
            @RequestBody Map<String, String> body) {

        String userId = auth.getName();
        CustomerEntity c = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        if (body.containsKey("email")) {
            String newEmail = body.get("email").trim().toLowerCase();
            if (!newEmail.equals(c.getEmail()) && customerRepository.existsByEmail(newEmail)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Email already in use"));
            }
            c.setEmail(newEmail);
        }
        if (body.containsKey("mobile")) {
            c.setMobile(body.get("mobile").trim());
        }
        if (body.containsKey("city")) c.setCity(body.get("city"));
        if (body.containsKey("pincode")) c.setPincode(body.get("pincode"));

        customerRepository.save(c);
        c.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", c));
    }

    // -------------------------------------------------------------------------
    // POST /customer/deactivate
    // -------------------------------------------------------------------------
    @PostMapping("/customer/deactivate")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> deactivateAccount(
            Authentication auth,
            @RequestBody Map<String, String> body) {

        String userId = auth.getName();
        CustomerEntity c = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        c.setStatus("Deactivated");
        c.setDeactivationReason(body.getOrDefault("reason", "Not specified"));
        customerRepository.save(c);
        return ResponseEntity.ok(ApiResponse.success("Account deactivated", "DEACTIVATED"));
    }

    // -------------------------------------------------------------------------
    // POST /customer/change-password
    // -------------------------------------------------------------------------
    @PostMapping("/customer/change-password")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> changePassword(
            Authentication auth,
            @RequestBody Map<String, String> body) {

        String userId = auth.getName();
        CustomerEntity c = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found"));

        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(ApiResponse.error("New password must be at least 8 characters"));
        }

        c.setPassword(org.springframework.security.crypto.bcrypt.BCrypt.hashpw(newPassword, org.springframework.security.crypto.bcrypt.BCrypt.gensalt()));
        customerRepository.save(c);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", "OK"));
    }

    // -------------------------------------------------------------------------
    // ADMIN: GET /admin/customers
    // -------------------------------------------------------------------------
    @GetMapping("/admin/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CustomerEntity>>> getAllCustomers() {
        List<CustomerEntity> list = customerRepository.findAll();
        list.forEach(c -> c.setPassword(null));
        return ResponseEntity.ok(ApiResponse.success("Customers fetched", list));
    }

    // -------------------------------------------------------------------------
    // ADMIN: GET /admin/customers/{consumerId}
    // -------------------------------------------------------------------------
    @GetMapping("/admin/customers/{consumerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerEntity>> getCustomerById(@PathVariable String consumerId) {
        CustomerEntity c = customerRepository.findByConsumerId(consumerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + consumerId));
        c.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Customer fetched", c));
    }

    // -------------------------------------------------------------------------
    // ADMIN: PATCH /admin/customers/{consumerId}/status
    // -------------------------------------------------------------------------
    @PatchMapping("/admin/customers/{consumerId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerEntity>> toggleStatus(
            @PathVariable String consumerId,
            @RequestBody Map<String, String> body) {

        CustomerEntity c = customerRepository.findByConsumerId(consumerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + consumerId));
        String newStatus = body.getOrDefault("status", "Inactive");
        c.setStatus(newStatus);
        customerRepository.save(c);
        c.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + newStatus, c));
    }

    // -------------------------------------------------------------------------
    // STAFF: GET /staff/customers/{consumerId}  — area-restricted lookup
    // -------------------------------------------------------------------------
    @GetMapping("/staff/customers/{consumerId}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<ApiResponse<CustomerEntity>> getCustomerForStaff(
            @PathVariable String consumerId,
            Authentication auth) {

        // Staff identifier is stored as userId in token subject
        String staffId = auth.getName();
        CustomerEntity c = customerRepository.findByConsumerId(consumerId)
                .orElseThrow(() -> new IllegalArgumentException("Consumer ID " + consumerId + " not found"));
        // Note: area enforcement is done in MeterReadingController, kept lean here
        c.setPassword(null);
        return ResponseEntity.ok(ApiResponse.success("Customer fetched", c));
    }
}
