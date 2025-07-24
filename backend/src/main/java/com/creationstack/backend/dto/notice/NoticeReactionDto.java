package com.creationstack.backend.dto.notice;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter 
@Setter
@NoArgsConstructor
public class NoticeReactionDto {
	private String emoji;
    
    private Long count;
    
    private boolean reacted;
    
    public NoticeReactionDto(String emoji, Long count) {
        this.emoji = emoji;
        this.count = count;
    }

}
