package com.creationstack.backend.dto.notice;

import java.time.LocalDateTime;
import java.util.List;

import com.creationstack.backend.domain.notice.Notice;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class NoticeDetailDto {
    private Long noticeId;
    private String content;
    private String thumbnailUrl;
    private String creatorName;
    private String creatorProfileImage;
    private LocalDateTime createdAt;
    private List<NoticeReactionDto> reactionSummary;
    private String userReactedEmoji; 

    public static NoticeDetailDto from(Notice notice, List<NoticeReactionDto> summary, String userEmoji) {
        NoticeDetailDto dto = new NoticeDetailDto();
        dto.setNoticeId(notice.getNoticeId());
        dto.setContent(notice.getContent());
        dto.setThumbnailUrl(notice.getThumbnailUrl());
        dto.setCreatorName(notice.getCreator().getUserDetail().getNickname());
        dto.setCreatorProfileImage(notice.getCreator().getUserDetail().getProfileImageUrl());
        dto.setCreatedAt(notice.getCreatedAt());
        dto.setReactionSummary(summary);
        dto.setUserReactedEmoji(userEmoji);
        return dto;
    }
}
