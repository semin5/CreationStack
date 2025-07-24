package com.creationstack.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.creationstack.backend.domain.comment.Comment;
import com.creationstack.backend.domain.comment.CommentLike;
import com.creationstack.backend.domain.user.User;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

    Optional<CommentLike> findByUserAndComment(User user, Comment comment);

    @Query("SELECT COUNT(cl) > 0 FROM CommentLike cl WHERE cl.user.userId = :userId AND cl.comment.commentId = :commentId AND cl.isActive = true")
    boolean isActiveLike(@Param("userId") Long userId, @Param("commentId") Long commentId);

}
