package com.creationstack.backend.domain.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_detail")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetail {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @MapsId
    private User user;

    @NotBlank(message = "실명은 필수 입력값입니다.")
    @Size(min = 2, max = 20, message = "실명은 2-20자 사이여야 합니다.")
    @Pattern(regexp = "^[가-힣a-zA-Z\\s]+$", message = "실명은 한글, 영문, 공백만 포함할 수 있습니다.")
    @Column(name = "username", nullable = false, length = 20)
    private String username;

    @NotBlank(message = "닉네임은 필수 입력값입니다.")
    @Size(min = 2, max = 10, message = "닉네임은 2-10자 사이여야 합니다.")
    @Pattern(regexp = "^[가-힣a-zA-Z0-9_-]+$", message = "닉네임은 한글, 영문, 숫자, _, - 만 포함할 수 있습니다.")
    @Column(name = "nickname", nullable = false, unique = true, length = 10)
    private String nickname;

    @Size(max = 500, message = "소개글은 500자 이하여야 합니다.")
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "platform_id")
    private String platformId;

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false)
    private Platform platform;

    @NotBlank(message = "이메일은 필수 입력값입니다.")
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", message = "올바른 이메일 형식을 입력해주세요 (예: user@example.com)")
    @Size(max = 100, message = "이메일은 100자 이하여야 합니다.")
    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Size(max = 512, message = "비밀번호가 너무 깁니다.")
    @Column(name = "password", length = 512)
    private String password;

    public enum Platform {
        LOCAL, KAKAO
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    // 플랫폼별 유효성 검사 헬퍼 메서드
    public boolean isKakaoUser() {
        return Platform.KAKAO.equals(this.platform);
    }

    public boolean isLocalUser() {
        return Platform.LOCAL.equals(this.platform);
    }

    // 비밀번호 필수 여부 검증
    public boolean isPasswordRequired() {
        return isLocalUser();
    }
}