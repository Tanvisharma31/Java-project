package com.vidyutseva.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Title is required")
    private String title; // Mr, Mrs, Ms, Dr

    @NotBlank(message = "Customer name is required")
    @Size(min = 2, max = 50, message = "Name must be 2-50 characters")
    @Pattern(regexp = "^[A-Za-z ]+$", message = "Name must contain only letters and spaces")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email required")
    @Size(max = 255)
    private String email;

    @NotBlank(message = "Country code is required")
    private String countryCode;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Mobile must be exactly 10 digits starting with 6, 7, 8, or 9")
    private String mobile;

    @NotBlank(message = "User ID is required")
    @Size(min = 5, max = 20, message = "User ID must be 5-20 characters")
    @Pattern(regexp = "^[A-Za-z0-9_]+$", message = "User ID may only contain letters, digits, and underscores")
    private String userId;

    @NotBlank(message = "Consumer ID is required")
    @Pattern(regexp = "^[0-9]{13}$", message = "Consumer ID must be exactly 13 digits")
    private String consumerId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 30, message = "Password must be 8-30 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,30}$",
        message = "Password must contain at least one uppercase, lowercase, digit, and special character"
    )
    private String password;

    @NotBlank(message = "Confirm password is required")
    private String confirmPassword;

    // Address / Area fields
    private String addressArea;
    private String city;
    private String pincode;

    @NotBlank(message = "Connection type is required")
    private String connectionType; // RESIDENTIAL, COMMERCIAL

    @NotNull(message = "Sanctioned load is required")
    @DecimalMin(value = "0.5", message = "Sanctioned load must be > 0")
    private Double sanctionedLoadKw;
}
