package com.creationstack.backend.dto.search;

import com.creationstack.backend.domain.content.AccessType;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchDto { // 콘텐츠 필터링 조건 Dto

    private String keyword; // 제목 + 내용 + 닉네임 통합 검색
    private List<Integer> categories; // 카테고리
    private AccessType accessType; // 유/무료
    private SearchMode searchMode = SearchMode.ALL; // 검색 모드, 기본값 통합검색
    private Long creatorId; // 크리에이터의 콘텐츠 검색 조건
}
