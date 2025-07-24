package com.creationstack.backend.dto.member;

import java.time.LocalDateTime;

import com.creationstack.backend.domain.user.User;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private boolean success;
    private UserProfileData data;

    @Data
    @Builder
    public static class UserProfileData {
        private Long userId;
        private String username;
        private String nickname;
        private String email;
        private User.UserRole role;
        private Integer jobId;
        private String jobName;
        private String bio;
        private String profileImageUrl;
        private boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
