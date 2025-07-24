package com.creationstack.backend.auth;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        log.info("=== JWT Filter 시작 - URI: {} ===", requestURI);

        String token = extractTokenFromRequest(request);
        log.info("추출된 토큰: {}", token != null ? "존재함" : "없음");

        if (StringUtils.hasText(token)) {
            log.info("토큰 검증 시작...");

            if (jwtUtil.validateAccessToken(token)) {
                log.info("토큰 검증 성공!");

                try {
                    Long userId = jwtUtil.getUserIdFromAccessToken(token);
                    String email = jwtUtil.getEmailFromToken(token);
                    String role = jwtUtil.getRoleFromToken(token);

                    log.info("토큰에서 추출된 정보 - userId: {}, email: {}, role: {}", userId, email, role);

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.info("인증 정보 설정 완료!");

                } catch (Exception e) {
                    log.error("JWT 인증 처리 중 오류 발생: {}", e.getMessage(), e);
                    SecurityContextHolder.clearContext();
                }
            } else {
                log.warn("토큰 검증 실패!");
            }
        } else {
            log.info("토큰이 없음");
        }

        log.info("=== JWT Filter 종료 ===");
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        log.info("Authorization 헤더: {}", bearerToken);

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.info("Bearer 토큰 추출됨");
            return token;
        }
        return null;
    }
}