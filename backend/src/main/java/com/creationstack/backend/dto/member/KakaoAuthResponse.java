package com.creationstack.backend.dto.member;

import lombok.Getter;

@Getter
public class KakaoAuthResponse {
    private boolean isRegistered;
    private String accessToken;
    private String refreshToken;
    private String email;
    private String platformId;

    // 로그인 성공 시 사용할 정적 팩토리 메서드
    public static KakaoAuthResponse loggedIn(String accessToken, String refreshToken) {
        KakaoAuthResponse response = new KakaoAuthResponse();
        response.isRegistered = true;
        response.accessToken = accessToken;
        response.refreshToken = refreshToken;
        return response;
    }

    // 회원가입 필요 시 사용할 정적 팩토리 메서드
    public static KakaoAuthResponse needsRegistration(String email, String platformId) {
        KakaoAuthResponse response = new KakaoAuthResponse();
        response.isRegistered = false;
        response.email = email;
        response.platformId = platformId;
        return response;
    }
}
