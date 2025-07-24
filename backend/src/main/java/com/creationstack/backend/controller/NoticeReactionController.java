package com.creationstack.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.creationstack.backend.dto.notice.NoticeReactionDto;
import com.creationstack.backend.service.NoticeReactionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notices")
public class NoticeReactionController {

    private final NoticeReactionService reactionService;

    
    @GetMapping("/{noticeId}/reactions")
    public ResponseEntity<List<NoticeReactionDto>> getReactions(
            @PathVariable Long noticeId,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());
        List<NoticeReactionDto> reactions = reactionService.getReactions(noticeId, userId);
        return ResponseEntity.ok(reactions);
    }

    
    @PostMapping("/{noticeId}/reactions")
    public ResponseEntity<Void> toggleReaction(
            @PathVariable Long noticeId,
            @RequestParam String emoji,
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());
        reactionService.toggleReaction(noticeId, userId, emoji);
        return ResponseEntity.ok().build();
    }
}

