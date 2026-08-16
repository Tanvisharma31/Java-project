package com.vidyutseva.auth.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponse {
    private String consumerId;
    private String name;
    private String email;
    private String userId;
    private String message;
}
