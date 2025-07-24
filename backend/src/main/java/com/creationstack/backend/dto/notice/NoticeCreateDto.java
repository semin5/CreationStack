package com.creationstack.backend.dto.notice;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NoticeCreateDto {

    private String content;
    private String thumbnailUrl;
    private Long creatorId;
}
