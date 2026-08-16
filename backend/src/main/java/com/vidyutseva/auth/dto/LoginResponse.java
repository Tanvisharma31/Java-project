package com.vidyutseva.auth.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class LoginResponse {
    private String token;
    private String userId;
    private String name;
    private String role;
    private String status;
    private List<String> consumerIds; // For customers with multiple connections
    private String areaAssigned;      // For staff
}
