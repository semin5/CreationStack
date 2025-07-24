package com.creationstack.backend.domain.content;

import java.time.LocalDateTime;

import com.creationstack.backend.domain.user.User;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "`like`")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long likeId; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(nullable = false)
    private Boolean isActive = true;
}
