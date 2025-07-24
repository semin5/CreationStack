package com.creationstack.backend.dto.search;

import com.creationstack.backend.domain.content.AccessType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto { // 콘텐츠 검색 결과 Dto

    private Long contentId; // 콘텐츠 ID
    private String title; // 제목
    private SearchCreatorDto creator; // 크리에이터 정보
    private String thumbnailUrl;
    private AccessType accessType; // 유/무료
    private int viewCount; // 조회수
    private int likeCount; // 좋아요수
    private int commentCount; // 댓글수
    private LocalDateTime createdAt; // 작성일(최신순 용)
    private List<String> categoryNames; // 카테고리 이름 목록
    private List<Integer> categoryIds; // 카테고리 ID 목록 (필터용)

}
