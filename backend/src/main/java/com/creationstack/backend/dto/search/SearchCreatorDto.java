package com.creationstack.backend.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SearchCreatorDto { // 크리에이터 검색 결과 Dto

    private Long userId; // 크리에이터 ID
    private String nickname; //크리에이터 닉네임
    private String profileImageUrl; // 크리에이터 섬네일
    private String job; // 크리에이터 직업
    private String bio; // 크리에이터 간단 자기소개
    private int subscriberCount; // 구독자 수
}
