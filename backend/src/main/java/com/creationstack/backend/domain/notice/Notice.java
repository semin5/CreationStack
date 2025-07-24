package com.creationstack.backend.domain.notice;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import com.creationstack.backend.domain.user.User;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long noticeId;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator_id")
	private User creator;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String content;

	@Column(name = "image_url", length=512)
	private String thumbnailUrl;

	@CreationTimestamp // 엔티티가 생성될 때 현재 시간 자동 삽입
    @Column(name = "created_at") 
    private LocalDateTime createdAt;

	@OneToMany(mappedBy = "notice", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<NoticeReaction> reactions = new ArrayList<>();

}
