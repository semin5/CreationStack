package com.creationstack.backend.repository.content;


import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.creationstack.backend.domain.content.Content;
import com.creationstack.backend.domain.content.ContentLike;
import com.creationstack.backend.domain.user.User;

public interface ContentLikeRepository extends JpaRepository<ContentLike, Long> {

    Optional<ContentLike> findByUserAndContent(User user, Content content);

    long countByContent(Content content);

    List<ContentLike> findByUserOrderByCreatedAtDesc(User user); 
    
    @Query("SELECT l FROM ContentLike l WHERE l.user.userId = :userId AND l.isActive = true ORDER BY l.createdAt DESC")
    Page<ContentLike> findByUserIdAndIsActiveTrue(@Param("userId") Long userId, Pageable pageable);

}
