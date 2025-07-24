package com.creationstack.backend.domain.notice;

import java.time.LocalDateTime;

import com.creationstack.backend.domain.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
public class NoticeReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notice_reaction_id")
    private Long noticeReactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notice_id")
    private Notice notice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 10, nullable = false)
    private String emoji;

    private LocalDateTime reactedAt;

    public NoticeReaction(Notice notice, User user, String emoji) {
        this.notice = notice;
        this.user = user;
        this.emoji = emoji;
        this.reactedAt = LocalDateTime.now();
    }
}

