package com.creationstack.backend.dto.member;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nickname;
    private String bio;
    private Integer jobId;
    private String ProfileImageUrl;
    private String currentPassword;
    private String newPassword;
}