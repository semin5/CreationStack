package com.creationstack.backend.dto.member;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenRefreshResponse {
    private boolean success;
    private String message;
    private TokenData data;

    @Data
    @Builder
    public static class TokenData {
        private String accessToken;
        private String tokenType;
        private long expiresIn;
    }
}
