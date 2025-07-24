package com.creationstack.backend.dto.member;

import com.creationstack.backend.domain.user.User.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {

    @NotBlank(message = "이메일은 필수입니다")
    @Email(message = "유효한 이메일 형식이 아닙니다")
    private String email;

    @NotBlank(message = "사용자명은 필수입니다")
    private String username;

    @NotBlank(message = "닉네임은 필수입니다")
    private String nickname;

    // 비밀번호는 LOCAL 사용자만 필수 (KAKAO 사용자는 null 가능)
    private String password;

    @NotNull(message = "역할은 필수입니다")
    private UserRole role;

    // 크리에이터인 경우 필수
    private Integer jobId;

    private String bio;

    // 플랫폼 관련 필드 (카카오 사용자용)
    private String platform; // "LOCAL" 또는 "KAKAO"
    private String platformId; // 카카오 사용자 ID

    // 유효성 검증 메서드들 추가
    public boolean isKakaoUser() {
        return "KAKAO".equals(platform);
    }

    public boolean isLocalUser() {
        return platform == null || "LOCAL".equals(platform);
    }
}