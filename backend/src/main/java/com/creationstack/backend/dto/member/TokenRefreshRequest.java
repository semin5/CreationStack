package com.creationstack.backend.dto.member;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {

    @NotBlank(message = "리프레시 토큰이 필요합니다.")
    private String refreshToken;
}
