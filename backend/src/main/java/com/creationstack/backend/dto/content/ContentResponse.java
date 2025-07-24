package com.creationstack.backend.dto.content;

import com.creationstack.backend.domain.content.AccessType;
import com.creationstack.backend.domain.content.Content;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 콘텐츠 정보를 클라이언트에게 전달하기 위한 DTO입니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentResponse {
        private Long contentId;
        private Long creatorId;
        private String creatorNickname; // 크리에이터 닉네임
        private String creatorJob;      // 크리에이터 직업 정보 추가
        private String creatorProfileUrl; // 크리에이터 프로필 이미지 URL
        private String title;
        private String content;
        private String thumbnailUrl;
        private int viewCount;
        private int likeCount;
        private int commentCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private AccessType accessType;
        private boolean isLiked;
        private Set<ContentCategoryResponse> categories; // 카테고리 목록
        private List<AttachmentResponse> attachments; // 첨부파일 목록

        /**
         * Content 엔티티로부터 ContentResponse DTO를 생성하는 정적 팩토리 메서드입니다.
         *
         * @param content Content 엔티티
         * @return ContentResponse DTO
         */
        public static ContentResponse from(Content content) {
        	return from(content, false);
        }
        
        public static ContentResponse from(Content content, boolean isLiked) {
                // 카테고리 매핑을 ContentCategoryResponse DTO로 변환
                Set<ContentCategoryResponse> categoryResponses = content.getCategoryMappings().stream()
                        .map(mapping -> ContentCategoryResponse.from(mapping.getCategory()))
                        .collect(Collectors.toSet());

                // 첨부파일을 AttachmentResponse DTO로 변환
                List<AttachmentResponse> attachmentResponses = content.getAttachments() != null
                        ? content.getAttachments().stream()
                        .map(AttachmentResponse::from)
                        .collect(Collectors.toList())
                        : List.of(); // 첨부파일이 없을 경우 빈 리스트 반환

                // 크리에이터 정보 (닉네임, 직업, 프로필 URL) 안전하게 가져오기
                String nickname = null;
                String jobName = null;
                String profileUrl = null;

                if (content.getCreator() != null) {
                        if (content.getCreator().getUserDetail() != null) {
                                nickname = content.getCreator().getUserDetail().getNickname();
                                profileUrl = content.getCreator().getUserDetail().getProfileImageUrl();
                        }
                        // Job 정보 추가
                        if (content.getCreator().getJob() != null) {
                                jobName = content.getCreator().getJob().getName();
                        }
                }

                return ContentResponse.builder()
                        .contentId(content.getContentId())
                        .creatorId(content.getCreator().getUserId())
                        .creatorNickname(nickname)
                        .creatorJob(jobName) // 직업 정보 설정
                        .creatorProfileUrl(profileUrl)
                        .title(content.getTitle())
                        .content(content.getContent())
                        .thumbnailUrl(content.getThumbnailUrl())
                        .viewCount(content.getViewCount())
                        .likeCount(content.getLikeCount())
                        .commentCount(content.getCommentCount())
                        .createdAt(content.getCreatedAt())
                        .updatedAt(content.getUpdatedAt())
                        .accessType(content.getAccessType())
                        .categories(categoryResponses)
                        .attachments(attachmentResponses)
                        .isLiked(isLiked)
                        .build();
        }
}
