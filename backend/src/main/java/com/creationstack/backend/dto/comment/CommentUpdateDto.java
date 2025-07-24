package com.creationstack.backend.dto.comment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommentUpdateDto {
	private String contentText;
	private Long userId;

}
