package com.creationstack.backend.controller;

import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.notice.*;
import com.creationstack.backend.service.notice.NoticeService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/creators/{creatorId}/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @PostMapping
    public ResponseEntity<NoticeResponseDto> createNotice(
            @PathVariable Long creatorId,
            @RequestBody NoticeCreateDto dto,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        dto.setCreatorId(creatorId);
        return ResponseEntity.ok(noticeService.createNotice(dto, userId));
    }

    @GetMapping
    public ResponseEntity<List<NoticeResponseDto>> getAllNotices(
        @PathVariable Long creatorId
    ) {
        return ResponseEntity.ok(noticeService.getAllNotices(creatorId));
    }

    @GetMapping("/{noticeId}")
    public ResponseEntity<NoticeDetailDto> getNotice(
            @PathVariable Long creatorId,
            @PathVariable Long noticeId,
        Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(noticeService.getNotice(noticeId, userId));
    }

    @PutMapping("/{noticeId}")
    public ResponseEntity<NoticeResponseDto> updateNotice(
            @PathVariable Long creatorId,
            @PathVariable Long noticeId,
            @RequestBody NoticeUpdateDto dto,
        Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ResponseEntity.ok(noticeService.updateNotice(noticeId, dto, userId));
    }

    @DeleteMapping("/{noticeId}")
    public ResponseEntity<Void> deleteNotice(
            @PathVariable Long creatorId,
            @PathVariable Long noticeId,
        Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        noticeService.deleteNotice(noticeId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{noticeId}/reaction")
    public ResponseEntity<Void> reactToNotice(
            @PathVariable Long creatorId,
            @PathVariable Long noticeId,
            @RequestParam String emoji,
        Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        noticeService.reactToNotice(noticeId, userId, emoji);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{noticeId}/reactions")
    public ResponseEntity<List<NoticeReactionDto>> getReactions(
            @PathVariable Long creatorId,
            @PathVariable Long noticeId) {
        return ResponseEntity.ok(noticeService.getReactions(noticeId));
    }
}
