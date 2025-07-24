package com.creationstack.backend.dto.comment;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentResponseDto {
	private Long commentId;
	private Long userId;
	private String nickname;
	private String job;
	private Long contentId;
	private Long parentCommentId;
	private String contentText;
	private LocalDateTime createdAt;
	private Boolean isDeleted;
	private boolean isLiked;
	private int likeCount;
	private String profileImageUrl;


}
