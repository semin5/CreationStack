package com.creationstack.backend.auth;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtil {

    private final SecretKey accessTokenKey;
    private final SecretKey refreshTokenKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtUtil(@Value("${jwt.secret}") String secret,
            @Value("${jwt.refresh-secret}") String refreshSecret,
            @Value("${jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.accessTokenKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.refreshTokenKey = Keys.hmacShaKeyFor(refreshSecret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    // Access Token 생성
    public String generateAccessToken(Long userId, String email, String role, String nickname, String platform) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);
        claims.put("nickname", nickname);
        claims.put("platform", platform);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(accessTokenKey, SignatureAlgorithm.HS512)
                .compact();
    }

    // Refresh Token 생성
    public String generateRefreshToken(Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(userId.toString())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(refreshTokenKey, SignatureAlgorithm.HS512) // ← HS256에서 HS512로 변경
                .compact();
    }

    // Access Token에서 사용자 ID 추출
    public Long getUserIdFromAccessToken(String token) {
        Claims claims = getClaimsFromToken(token, accessTokenKey);
        return claims.get("userId", Long.class);
    }

    // Refresh Token에서 사용자 ID 추출
    public Long getUserIdFromRefreshToken(String token) {
        Claims claims = getClaimsFromToken(token, refreshTokenKey);
        return claims.get("userId", Long.class);
    }

    // 토큰에서 이메일 추출
    public String getEmailFromToken(String token) {
        Claims claims = getClaimsFromToken(token, accessTokenKey);
        return claims.get("email", String.class);
    }

    // 토큰에서 역할 추출
    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token, accessTokenKey);
        return claims.get("role", String.class);
    }

    // 토큰 유효성 검증
    public boolean validateAccessToken(String token) {
        try {
            getClaimsFromToken(token, accessTokenKey);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid access token: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            getClaimsFromToken(token, refreshTokenKey);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid refresh token: {}", e.getMessage());
            return false;
        }
    }

    // 토큰 만료 여부 확인
    public boolean isTokenExpired(String token, boolean isRefreshToken) {
        try {
            SecretKey key = isRefreshToken ? refreshTokenKey : accessTokenKey;
            Claims claims = getClaimsFromToken(token, key);
            return claims.getExpiration().before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }

    // 토큰에서 Claims 추출
    private Claims getClaimsFromToken(String token, SecretKey key) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // 토큰에서 platform 추출 메서드 추가
    public String getPlatformFromToken(String token) {
        Claims claims = getClaimsFromToken(token, accessTokenKey);
        return claims.get("platform", String.class);
    }

    // Access Token 만료 시간 반환 (초 단위)
    public long getAccessTokenExpirationInSeconds() {
        return accessTokenExpiration / 1000;
    }

    // Refresh Token 만료 시간 반환 (초 단위)
    public long getRefreshTokenExpirationInSeconds() {
        return refreshTokenExpiration / 1000;
    }

}
