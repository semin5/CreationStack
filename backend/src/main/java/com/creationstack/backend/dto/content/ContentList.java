package com.creationstack.backend.dto.content;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import com.creationstack.backend.domain.content.AccessType;
import com.creationstack.backend.domain.content.Content;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentList  {
    private Long contentId;
    private String title;
    private String creatorName;
    private String job;
    private String category;
    private String thumbnailUrl;
    private Boolean isPaid;
    private int viewCount;
    private boolean isLiked;
    private LocalDateTime createdAt;
    
    public static ContentList from(Content content, boolean isLiked) {
        if (content == null) {
            System.out.println("❌ content is null");
            return null;
        }

        String creatorNickname = null;
        String jobName = null;

        if (content.getCreator() != null) {
            if (content.getCreator().getUserDetail() != null) {
                creatorNickname = content.getCreator().getUserDetail().getNickname();
            }

            if (content.getCreator().getJob() != null) {
                jobName = content.getCreator().getJob().getName();
            }
        }

        String categoryName = null;
        if (!content.getCategoryMappings().isEmpty()) {
            categoryName = content.getCategoryMappings().iterator().next().getCategory().getName();
        }

        return new ContentList(
            content.getContentId(),
            content.getTitle(),
            creatorNickname,
            jobName,
            categoryName,
            content.getThumbnailUrl(),
            content.getAccessType() == AccessType.SUBSCRIBER,
            content.getViewCount(),
            isLiked,
            content.getCreatedAt()
        );
    }



}


