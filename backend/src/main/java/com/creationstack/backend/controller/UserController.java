package com.creationstack.backend.controller;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.creationstack.backend.dto.member.EmailCheckResponse;
import com.creationstack.backend.dto.member.NicknameCheckResponse;
import com.creationstack.backend.dto.member.SignupRequest;
import com.creationstack.backend.dto.member.SignupResponse;
import com.creationstack.backend.service.AuthService;
import com.creationstack.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final AuthService authService;

    @PostMapping
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody SignupRequest request,
            BindingResult bindingResult) {

        // 유효성 검사 오류 처리
        if (bindingResult.hasErrors()) {
            String errorMessage = bindingResult.getFieldErrors().stream()
                    .map(error -> error.getDefaultMessage())
                    .collect(Collectors.joining(", "));

            SignupResponse response = SignupResponse.builder()
                    .success(false)
                    .message("입력 정보가 올바르지 않습니다: " + errorMessage)
                    .build();

            return ResponseEntity.badRequest().body(response);
        }

        try {
            SignupResponse response = authService.signup(request);

            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }

        } catch (IllegalArgumentException e) {
            log.error("회원가입 실패: {}", e.getMessage());
            SignupResponse response = SignupResponse.builder()
                    .success(false)
                    .message(e.getMessage())
                    .build();
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            log.error("회원가입 중 예상치 못한 오류 발생", e);
            SignupResponse response = SignupResponse.builder()
                    .success(false)
                    .message("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<EmailCheckResponse> checkEmailDuplicate(@RequestParam String email) {
        try {
            boolean isAvailable = authService.isEmailAvailable(email);

            EmailCheckResponse response = EmailCheckResponse.builder()
                    .success(true)
                    .available(isAvailable)
                    .message(isAvailable ? "사용 가능한 이메일입니다." : "이미 사용 중인 이메일입니다.")
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("이메일 중복 확인 중 오류 발생", e);
            EmailCheckResponse response = EmailCheckResponse.builder()
                    .success(false)
                    .available(false)
                    .message("이메일 중복 확인 중 오류가 발생했습니다.")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<NicknameCheckResponse> checkNicknameDuplicate(@RequestParam String nickname) {
        try {
            boolean isAvailable = authService.isNicknameAvailable(nickname);

            NicknameCheckResponse response = NicknameCheckResponse.builder()
                    .success(true)
                    .available(isAvailable)
                    .message(isAvailable ? "사용 가능한 닉네임입니다." : "이미 존재하는 닉네임입니다.")
                    .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("닉네임 중복 확인 중 오류 발생", e);
            NicknameCheckResponse response = NicknameCheckResponse.builder()
                    .success(false)
                    .available(false)
                    .message("닉네임 중복 확인 중 오류가 발생했습니다.")
                    .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private final UserService userService;

    @DeleteMapping("/me")
    public ResponseEntity<Void> unregisterUser(Authentication authentication) {
        if (authentication == null) {
            throw new IllegalStateException("인증된 사용자 정보가 없습니다.");
        }

        Long userId = Long.parseLong(authentication.getName());

        userService.softDeleteUser(userId);

        return ResponseEntity.ok().build();
    }
}