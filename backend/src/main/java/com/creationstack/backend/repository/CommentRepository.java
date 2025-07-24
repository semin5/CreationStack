package com.creationstack.backend.repository;

import java.util.List;

import com.creationstack.backend.domain.content.Content;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.creationstack.backend.domain.comment.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

	@Query("""
		    SELECT c FROM Comment c
		    JOIN FETCH c.user u
		    LEFT JOIN FETCH u.userDetail
		    LEFT JOIN FETCH u.job
		    LEFT JOIN FETCH c.parentComment
		    WHERE c.content = :content
		""")
		List<Comment> findByContentWithAll(@Param("content") Content content);


	@Modifying(clearAutomatically = true, flushAutomatically = true)
	@Transactional
	@Query("UPDATE Comment c SET c.isDeleted = true WHERE c.commentId = :commentId")
	void markAsDeleted(@Param("commentId") Long commentId);

}
