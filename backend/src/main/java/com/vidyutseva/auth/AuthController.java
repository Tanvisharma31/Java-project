package com.vidyutseva.auth;

import com.vidyutseva.auth.dto.*;
import com.vidyutseva.common.ApiResponse;
import com.vidyutseva.entity.*;
import com.vidyutseva.repository.*;
import com.vidyutseva.security.JwtUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@RequiredArgsConstructor
public class AuthController {

    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    // -------------------------------------------------------------------------
    // POST /auth/login
    // -------------------------------------------------------------------------
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest req) {
        String role = req.getRole().toUpperCase();
        System.out.println("Login attempt - Role: " + role + ", UserId: " + req.getUserId());

        return switch (role) {
            case "ADMIN" -> authenticateAdmin(req);
            case "STAFF"  -> authenticateStaff(req);
            case "CUSTOMER" -> authenticateCustomer(req);
            default -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Unknown role: " + req.getRole()));
        };
    }

    private ResponseEntity<ApiResponse<LoginResponse>> authenticateAdmin(LoginRequest req) {
        if (!"admin".equals(req.getUserId())
                || !passwordEncoder.matches(req.getPassword(), "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid admin credentials"));
        }
        String token = jwtUtils.generateJwtToken("admin", "ADMIN");
        LoginResponse resp = LoginResponse.builder()
                .token(token).userId("admin").name("System Administrator").role("ADMIN").status("Active").build();
        return ResponseEntity.ok(ApiResponse.success("Admin login successful", resp));
    }

    private ResponseEntity<ApiResponse<LoginResponse>> authenticateStaff(LoginRequest req) {
        StaffEntity staff = staffRepository.findByStaffId(req.getUserId()).orElse(null);
        if (staff == null || !passwordEncoder.matches(req.getPassword(), staff.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid staff credentials"));
        }
        if (!"Active".equals(staff.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Staff account is inactive. Contact admin."));
        }
        String token = jwtUtils.generateJwtToken(staff.getStaffId(), "STAFF");
        LoginResponse resp = LoginResponse.builder()
                .token(token).userId(staff.getStaffId()).name(staff.getName())
                .role("STAFF").status(staff.getStatus())
                .areaAssigned(staff.getAreaAssigned()).build();
        return ResponseEntity.ok(ApiResponse.success("Staff login successful", resp));
    }

    private ResponseEntity<ApiResponse<LoginResponse>> authenticateCustomer(LoginRequest req) {
        System.out.println("Authenticating customer: " + req.getUserId());
        CustomerEntity customer = customerRepository.findByUserId(req.getUserId()).orElse(null);
        System.out.println("Customer found: " + (customer != null));
        
        if (customer == null || !passwordEncoder.matches(req.getPassword(), customer.getPassword())) {
            System.out.println("Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid User ID or Password"));
        }
        if ("Deactivated".equals(customer.getStatus())) {
            System.out.println("Account deactivated");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Account deactivated. Reason: " + customer.getDeactivationReason()));
        }
        
        String token = jwtUtils.generateJwtToken(customer.getUserId(), "CUSTOMER");
        System.out.println("Token generated: " + (token != null && !token.isEmpty()));
        
        LoginResponse resp = LoginResponse.builder()
                .token(token).userId(customer.getUserId()).name(customer.getName())
                .role("CUSTOMER").status(customer.getStatus())
                .consumerIds(List.of(customer.getConsumerId())).build();
        
        System.out.println("LoginResponse built: " + resp);
        ResponseEntity<ApiResponse<LoginResponse>> response = ResponseEntity.ok(ApiResponse.success("Customer login successful", resp));
        System.out.println("Response built: " + response);
        return response;
    }

    // -------------------------------------------------------------------------
    // POST /auth/register
    // -------------------------------------------------------------------------
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@Valid @RequestBody RegisterRequest req) {
        // Confirm password match
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Password and confirm password do not match"));
        }
        // Uniqueness checks
        if (customerRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email is already registered"));
        }
        if (customerRepository.existsByMobile(req.getMobile())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Mobile number is already registered"));
        }
        if (customerRepository.existsByUserId(req.getUserId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("User ID is already taken"));
        }
        if (customerRepository.existsByConsumerId(req.getConsumerId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Consumer ID is already registered"));
        }

        CustomerEntity customer = CustomerEntity.builder()
                .consumerId(req.getConsumerId())
                .title(req.getTitle())
                .name(req.getName().trim())
                .email(req.getEmail().trim().toLowerCase())
                .mobile(req.getMobile().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .userId(req.getUserId().trim())
                .status("Active")
                .addressArea(req.getAddressArea() != null ? req.getAddressArea() : "General")
                .city(req.getCity())
                .pincode(req.getPincode())
                .connectionType(req.getConnectionType())
                .sanctionedLoadKw(BigDecimal.valueOf(req.getSanctionedLoadKw()))
                .previousMeterReading(0)
                .build();

        customerRepository.save(customer);

        RegisterResponse resp = RegisterResponse.builder()
                .consumerId(req.getConsumerId())
                .name(customer.getName())
                .email(customer.getEmail())
                .userId(customer.getUserId())
                .message("Customer registered successfully")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", resp));
    }
}
