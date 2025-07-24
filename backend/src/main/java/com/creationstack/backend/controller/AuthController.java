package com.creationstack.backend.controller;

import com.creationstack.backend.dto.member.KakaoAuthResponse;
import com.creationstack.backend.dto.member.LoginRequest;
import com.creationstack.backend.dto.member.LoginResponse;
import com.creationstack.backend.dto.member.LogoutRequest;
import com.creationstack.backend.dto.member.LogoutResponse;
import com.creationstack.backend.dto.member.TokenRefreshRequest;
import com.creationstack.backend.dto.member.TokenRefreshResponse;
import com.creationstack.backend.service.AuthService;
import com.creationstack.backend.service.KakaoAuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")  
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final KakaoAuthService kakaoAuthService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            LoginResponse response = LoginResponse.builder().success(false).message("입력 정보가 올바르지 않습니다: " + errorMessage)
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
        try {
            LoginResponse response = authService.login(request);
            if (response.isSuccess()) {
                log.info("로그인 성공: {}", request.getEmail());
                return ResponseEntity.ok(response);
            } else {
                log.warn("로그인 실패: {} - {}", request.getEmail(), response.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            log.error("로그인 처리 중 예상치 못한 오류 발생", e);
            LoginResponse response = LoginResponse.builder().success(false).message("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request,
            BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            TokenRefreshResponse response = TokenRefreshResponse.builder().success(false).message("리프레시 토큰이 필요합니다.")
                    .build();
            return ResponseEntity.badRequest().body(response);
        }
        try {
            TokenRefreshResponse response = authService.refreshToken(request);
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            log.error("토큰 갱신 중 오류 발생", e);
            TokenRefreshResponse response = TokenRefreshResponse.builder().success(false).message("토큰 갱신에 실패했습니다.")
                    .build();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(@Valid @RequestBody LogoutRequest request,
            BindingResult bindingResult) {
        // ... (기존 로그아웃 로직)
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.joining(", "));
            LogoutResponse response = LogoutResponse.error("입력 정보가 올바르지 않습니다: " + errorMessage);
            return ResponseEntity.badRequest().body(response);
        }
        try {
            LogoutResponse response = authService.logout(request);
            if (response.isSuccess()) {
                log.info("로그아웃 성공");
                return ResponseEntity.ok(response);
            } else {
                log.warn("로그아웃 실패: {}", response.getMessage());
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            log.error("로그아웃 처리 중 예상치 못한 오류 발생", e);
            LogoutResponse response = LogoutResponse.error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/kakao/callback")
    public void kakaoLogin(@RequestParam String code, HttpServletResponse response) throws IOException {
        KakaoAuthResponse authResponse = kakaoAuthService.processKakaoLogin(code);

        String redirectUrl;
        if (authResponse.isRegistered()) {
            // 이미 가입된 유저 -> 토큰과 함께 최종 콜백 페이지로
            redirectUrl = "http://localhost:5173/auth/callback?accessToken=" + authResponse.getAccessToken()
                    + "&refreshToken=" + authResponse.getRefreshToken();
        } else {
            // 신규 유저 -> 이메일, platformId와 함께 회원가입 페이지로
            String email = URLEncoder.encode(authResponse.getEmail(), StandardCharsets.UTF_8);
            redirectUrl = "http://localhost:5173/register?email=" + email
                    + "&platform=KAKAO&platformId=" + authResponse.getPlatformId();
        }
        response.sendRedirect(redirectUrl);
    }
}
