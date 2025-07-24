package com.creationstack.backend.domain.comment;

import com.creationstack.backend.domain.user.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "comment_like", uniqueConstraints = { @UniqueConstraint(columnNames = { "comment_id", "user_id" }) })
public class CommentLike {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long likeId;

	@ManyToOne
	@JoinColumn(name = "comment_id")
	private Comment comment;

	@ManyToOne
	@JoinColumn(name = "user_id")
	private User user;

	private boolean isActive = true;

	public void toggle() {
		this.isActive = !this.isActive;
	}

	public CommentLike(Comment comment, User user) {
		this.comment = comment;
		this.user = user;
		this.isActive = true;
	}

}
