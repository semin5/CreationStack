package com.creationstack.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentCreateDto {
	private Long contentId;
	private Long userId;
	private String contentText;
	private Long parentCommentId;

}
