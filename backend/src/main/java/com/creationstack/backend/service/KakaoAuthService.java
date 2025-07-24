package com.creationstack.backend.service;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod; // 새로 만들 DTO
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.creationstack.backend.auth.JwtUtil;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.domain.user.UserDetail;
import com.creationstack.backend.dto.member.KakaoAuthResponse;
import com.creationstack.backend.repository.UserDetailRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class KakaoAuthService {

    private final UserDetailRepository userDetailRepository;
    private final JwtUtil jwtUtil;
    private final AuthService authService;

    @Value("${kakao.client-id}")
    private String kakaoClientId;

    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUri;

    /**
     * 카카오 인가 코드로 사용자를 확인하고, 가입 여부에 따라 다른 정보를 반환하는 메인 메서드
     * 
     * @param code 카카오 서버로부터 받은 인가 코드
     * @return KakaoAuthResponse (가입 여부, 토큰 또는 이메일 정보 포함)
     */
    public KakaoAuthResponse processKakaoLogin(String code) throws JsonProcessingException {
        String kakaoAccessToken = getKakaoAccessToken(code);
        JsonNode kakaoUserInfo = getKakaoUserInfo(kakaoAccessToken);

        if (kakaoUserInfo.get("id") == null) {
            throw new IllegalArgumentException("카카오 응답에 사용자 ID가 없습니다.");
        }
        String platformId = kakaoUserInfo.get("id").asText();

        JsonNode kakaoAccount = kakaoUserInfo.path("kakao_account");
        if (kakaoAccount.isMissingNode() || !kakaoAccount.has("email")) {
            throw new IllegalArgumentException("카카오 응답에 이메일 정보가 없거나 사용자가 동의하지 않았습니다.");
        }
        String email = kakaoAccount.get("email").asText();

        // 이메일로 우리 서비스의 가입 여부 확인
        Optional<UserDetail> userDetailOptional = userDetailRepository.findByEmail(email);

        if (userDetailOptional.isPresent()) {
            // --- 이미 가입된 유저 ---
            User user = userDetailOptional.get().getUser();

            // 우리 서비스의 JWT 토큰 생성
            String accessToken = jwtUtil.generateAccessToken(
                    user.getUserId(),
                    user.getUserDetail().getEmail(),
                    user.getRole().name(),
                    user.getUserDetail().getNickname(),
                    user.getUserDetail().getPlatform().name());
            String refreshToken = jwtUtil.generateRefreshToken(user.getUserId());
            authService.saveRefreshToken(user.getUserId(), refreshToken);

            return KakaoAuthResponse.loggedIn(accessToken, refreshToken);
        } else {
            // --- 신규 유저 ---
            return KakaoAuthResponse.needsRegistration(email, platformId);
        }
    }

    // ... (getKakaoAccessToken, getKakaoUserInfo private 메서드는 기존과 동일)
    private String getKakaoAccessToken(String code) throws JsonProcessingException {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("client_id", kakaoClientId);
        body.add("redirect_uri", kakaoRedirectUri);
        body.add("code", code);

        HttpEntity<MultiValueMap<String, String>> kakaoTokenRequest = new HttpEntity<>(body, headers);
        RestTemplate rt = new RestTemplate();
        ResponseEntity<String> response = rt.exchange(
                "https://kauth.kakao.com/oauth/token",
                HttpMethod.POST,
                kakaoTokenRequest,
                String.class);

        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.readTree(response.getBody()).get("access_token").asText();
    }

    private JsonNode getKakaoUserInfo(String accessToken) throws JsonProcessingException {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + accessToken);
        headers.add("Content-type", "application/x-www-form-urlencoded;charset=utf-8");

        HttpEntity<MultiValueMap<String, String>> kakaoUserInfoRequest = new HttpEntity<>(headers);
        RestTemplate rt = new RestTemplate();
        ResponseEntity<String> response = rt.exchange(
                "https://kapi.kakao.com/v2/user/me",
                HttpMethod.POST,
                kakaoUserInfoRequest,
                String.class);

        return new ObjectMapper().readTree(response.getBody());
    }
}
