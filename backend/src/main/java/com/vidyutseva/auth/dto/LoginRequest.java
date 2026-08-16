package com.vidyutseva.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "User ID is required")
    @Size(min = 1, max = 20, message = "User ID must be 1-20 characters")
    private String userId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 30, message = "Password must be 8-30 characters")
    private String password;

    @NotBlank(message = "Role is required")
    private String role; // ADMIN, STAFF, CUSTOMER
}
