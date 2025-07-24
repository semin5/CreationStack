package com.creationstack.backend.domain.comment;

import java.time.LocalDateTime;

import com.creationstack.backend.domain.content.Content;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.comment.CommentResponseDto;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name="comment")
public class Comment {
	
@Id
@GeneratedValue(strategy=GenerationType.IDENTITY)
private Long commentId;

@ManyToOne(fetch=FetchType.LAZY)
@JoinColumn(name="user_id")
private User user;

@ManyToOne(fetch=FetchType.LAZY)
@JoinColumn(name="content_id")
private Content content;

@ManyToOne(fetch=FetchType.LAZY)
@JoinColumn(name="parent_comment_id")
private Comment parentComment;

@Column(name="content", columnDefinition = "TEXT", nullable=false)
private String contentText;

private int likeCount;

@Column(name = "is_deleted")
private boolean isDeleted=false;

@Column(name="created_at")
private LocalDateTime createdAt=LocalDateTime.now();

}
