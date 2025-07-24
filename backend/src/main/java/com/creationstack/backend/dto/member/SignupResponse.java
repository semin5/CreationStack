package com.creationstack.backend.dto.member;

import java.time.LocalDateTime;

import com.creationstack.backend.domain.user.User;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SignupResponse {
    private boolean success;
    private String message;
    private UserData data;
    private String redirect;

    @Data
    @Builder
    public static class UserData {
        private UserInfo user;
        private TokenInfo tokens;
    }

    @Data
    @Builder
    public static class UserInfo {
        private Long userId;
        private String username;
        private String nickname;
        private String email;
        private User.UserRole role;
        private Integer jobId;
        private String jobName;
        private String bio;
        private boolean isActive;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    public static class TokenInfo {
        private String accessToken;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
    }
}
