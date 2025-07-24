package com.creationstack.backend.dto.member;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LogoutResponse {
    private boolean success;
    private String message;

    public static LogoutResponse success() {
        return LogoutResponse.builder()
                .success(true)
                .message("로그아웃이 완료되었습니다.")
                .build();
    }

    public static LogoutResponse error(String message) {
        return LogoutResponse.builder()
                .success(false)
                .message(message)
                .build();
    }
}
