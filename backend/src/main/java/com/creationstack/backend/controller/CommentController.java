package com.creationstack.backend.controller;

import java.nio.file.AccessDeniedException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.comment.CommentCreateDto;
import com.creationstack.backend.dto.comment.CommentResponseDto;
import com.creationstack.backend.dto.comment.CommentUpdateDto;
import com.creationstack.backend.repository.UserRepository;
import com.creationstack.backend.service.CommentService;

import lombok.RequiredArgsConstructor;

@Transactional
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contents/{contentId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;
   
    private Long getUserIdFromAuth(Authentication authentication) {
    	 Object principal = authentication.getPrincipal();  
        return (Long) authentication.getPrincipal(); 
    }
    
    // 댓글 목록 조회 
    @GetMapping
    public ResponseEntity<List<CommentResponseDto>> getComments(
            @PathVariable("contentId") Long contentId,
            Authentication authentication) {

    	Long userId = null;
        if (authentication != null && authentication.isAuthenticated()) {
            try {
                userId = getUserIdFromAuth(authentication);
            } catch (Exception ignored) {
                userId = null;
            }
        }

        List<CommentResponseDto> comments = commentService.getCommentsByContentId(contentId, userId);
        return ResponseEntity.ok(comments);
    }

    //  댓글 작성
    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable("contentId") Long contentId,
            @RequestBody CommentCreateDto dto,
            Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = getUserIdFromAuth(authentication);
        dto.setContentId(contentId);
        dto.setUserId(userId);

        CommentResponseDto created = commentService.createComment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 댓글 수정
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponseDto> updateComment(
            @PathVariable Long contentId,
            @PathVariable Long commentId,
            @RequestBody CommentUpdateDto dto,
            Authentication authentication) throws AccessDeniedException {

        Long userId = getUserIdFromAuth(authentication);
        dto.setUserId(userId);

        CommentResponseDto updated = commentService.updateComment(commentId, dto);
        return ResponseEntity.ok(updated);
    }

    //  댓글 삭제
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long contentId,
            @PathVariable Long commentId,
            Authentication authentication) throws AccessDeniedException {

        Long userId = getUserIdFromAuth(authentication);
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }

    // 댓글 좋아요 토글
    @PostMapping("/{commentId}/like")
    public ResponseEntity<String> toggleLike(
            @PathVariable Long contentId,
            @PathVariable Long commentId,
            Authentication authentication) {

        Long userId = getUserIdFromAuth(authentication);
        boolean isLiked = commentService.toggleLike(commentId, userId);
        return ResponseEntity.ok(isLiked ? "liked" : "unliked");
    }
}
