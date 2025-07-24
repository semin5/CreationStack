package com.creationstack.backend.dto.member;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NicknameCheckResponse {
    private boolean success;
    private boolean available;
    private String message;
}