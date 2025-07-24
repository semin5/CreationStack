package com.creationstack.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.creationstack.backend.domain.notice.Notice;
import com.creationstack.backend.domain.notice.NoticeReaction;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.notice.NoticeReactionDto;

public interface NoticeReactionRepository extends JpaRepository<NoticeReaction, Long> {

    Optional<NoticeReaction> findByNoticeAndUser(Notice notice, User user);
    List<NoticeReaction> findByNotice(Notice notice);

    Long countByNoticeAndEmoji(Notice notice, String emoji);

    void deleteByNotice(Notice notice);

    @Query("SELECT new com.creationstack.backend.dto.notice.NoticeReactionDto(r.emoji, COUNT(r)) " +
            "FROM NoticeReaction r WHERE r.notice = :notice GROUP BY r.emoji")
    List<NoticeReactionDto> findGroupedByEmoji(@Param("notice") Notice notice);


}
