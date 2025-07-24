package com.creationstack.backend.dto.content;


import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentDetail {
    private Long contentId;
    private String title;
    private String content;
    private String creatorName;
    private String thumbnailUrl;
    private Boolean isPaid;
    private String categoryName;
    private int viewCount;
    private boolean liked;
    private long likeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isLiked;
    private List<AttachmentResponse> attachments;
}