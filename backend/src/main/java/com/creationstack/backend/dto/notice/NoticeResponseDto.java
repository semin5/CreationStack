package com.creationstack.backend.dto.notice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class NoticeResponseDto {

    private Long noticeId;
    private String content;
    private String thumbnailUrl;
    private String creatorName;
    private LocalDateTime createdAt;
}
