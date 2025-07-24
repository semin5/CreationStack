package com.creationstack.backend.domain.user;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tokens") // 실제 테이블 이름과 일치
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "token_id") // DB 컬럼명과 일치하도록 명시
    private Long id;

    @Column(name = "refresh_token", nullable = false, unique = true, length = 512) // DB 컬럼명과 일치하도록 명시
    private String token;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "expire_at", nullable = false) // DB 컬럼명과 일치하도록 명시
    private LocalDateTime expiresAt;

    @Column(name = "issued_at", nullable = false) // DB 컬럼명과 일치하도록 명시 (SQL의 issued_at)
    private LocalDateTime createdAt;

    @Column(name = "is_revoked", nullable = false) // 이 컬럼이 DB 테이블에 추가되어야 합니다.
    @Builder.Default
    private Boolean isRevoked = false;
}
