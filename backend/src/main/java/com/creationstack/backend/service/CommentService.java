package com.creationstack.backend.service;

import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.creationstack.backend.domain.comment.Comment;
import com.creationstack.backend.domain.comment.CommentLike;
import com.creationstack.backend.domain.content.Content;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.comment.CommentCreateDto;
import com.creationstack.backend.dto.comment.CommentResponseDto;
import com.creationstack.backend.dto.comment.CommentUpdateDto;
import com.creationstack.backend.repository.CommentLikeRepository;
import com.creationstack.backend.repository.CommentRepository;
import com.creationstack.backend.repository.UserRepository;
import com.creationstack.backend.repository.content.ContentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final CommentLikeRepository commentLikeRepository;

    // 댓글 등록
    public CommentResponseDto createComment(CommentCreateDto dto) {
        User user = userRepository.findByUserIdAndIsActiveTrue(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));

        Content content = contentRepository.findById(dto.getContentId())
                .orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setContent(content);
        comment.setContentText(dto.getContentText());

        if (dto.getParentCommentId() != null) {
            Comment parent = commentRepository.findById(dto.getParentCommentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글 없음"));
            comment.setParentComment(parent);
        }

        Comment saved = commentRepository.save(comment);
        return toDto(saved, user.getUserId());
    }

    // 댓글 목록 조회
    public List<CommentResponseDto> getCommentsByContentId(Long contentId, Long userId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("콘텐츠 없음"));

        List<Comment> comments = commentRepository.findByContentWithAll(content);

        return comments.stream()
                .map(comment -> toDto(comment, userId))
                .collect(Collectors.toList());
    }

    // 댓글 수정
    @Transactional
    public CommentResponseDto updateComment(Long commentId, CommentUpdateDto dto) throws AccessDeniedException {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

        if (!comment.getUser().getUserId().equals(dto.getUserId())) {
            throw new AccessDeniedException("수정 권한이 없습니다.");
        }

        comment.setContentText(dto.getContentText());
        return toDto(comment, dto.getUserId());
    }

    // 댓글 삭제
    @Transactional
    public void deleteComment(Long commentId, Long userId) throws AccessDeniedException {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글 없음"));

        if (!comment.getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("삭제 권한이 없습니다.");
        }

        commentRepository.markAsDeleted(commentId);
    }

    // 댓글 좋아요 토글
    @Transactional
    public boolean toggleLike(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다."));

        CommentLike commentLike = commentLikeRepository.findByUserAndComment(user, comment).orElse(null);

        if (commentLike == null) {
            commentLike = new CommentLike(comment, user);
            commentLikeRepository.save(commentLike);
            comment.setLikeCount(comment.getLikeCount() + 1);
        } else {
            commentLike.toggle();
            commentLikeRepository.save(commentLike);

            if (commentLike.isActive()) {
                comment.setLikeCount(comment.getLikeCount() + 1);
            } else {
                comment.setLikeCount(Math.max(0, comment.getLikeCount() - 1));
            }
        }

        commentRepository.save(comment);
        return commentLike.isActive();
    }

    // 응답용 DTO 변환 (좋아요 여부 포함)
    private CommentResponseDto toDto(Comment comment, Long userId) {
        CommentResponseDto dto = new CommentResponseDto();
        dto.setCommentId(comment.getCommentId());
        dto.setUserId(comment.getUser().getUserId());

        if (comment.getUser().getUserDetail() != null) {
            dto.setNickname(comment.getUser().getUserDetail().getNickname());
        }
        if (comment.getUser().getJob() != null) {
            dto.setJob(comment.getUser().getJob().getName());
        }

        dto.setContentId(comment.getContent().getContentId());
        dto.setParentCommentId(
                comment.getParentComment() != null ? comment.getParentComment().getCommentId() : null);
        dto.setContentText(comment.isDeleted() ? "삭제된 댓글입니다" : comment.getContentText());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setIsDeleted(comment.isDeleted());
        dto.setLikeCount(comment.getLikeCount());
        dto.setProfileImageUrl(comment.getUser().getUserDetail().getProfileImageUrl());
        
        if (userId != null) {
        	dto.setLiked(commentLikeRepository.isActiveLike(userId, comment.getCommentId()));
        } else {
            dto.setLiked(false);
        }

        return dto;
    }
}