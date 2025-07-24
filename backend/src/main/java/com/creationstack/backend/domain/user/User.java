package com.creationstack.backend.domain.user;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.creationstack.backend.domain.content.ContentLike;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @NotNull(message = "역할은 필수 선택값입니다.")
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id")
    private Job job;

    @Min(value = 0, message = "구독자 수는 0 이상이어야 합니다.")
    @Column(name = "subscriber_count", nullable = false)
    @Builder.Default
    private Integer subscriberCount = 0;

    @NotNull(message = "활성화 상태는 필수입니다.")
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserDetail userDetail;

    @OneToMany(mappedBy = "user")
    @Builder.Default
    private List<ContentLike> likes = new ArrayList<>();

    public enum UserRole {
        USER, CREATOR
    }

    @AssertTrue(message = "크리에이터는 직업을 선택해야 합니다.")
    private boolean isJobValidForCreator() {
        if (this.isActive == false) {
            return true;
        }

        if (UserRole.CREATOR.equals(this.role)) {
            return this.job != null && this.job.getJobId() != null && this.job.getJobId() > 0;
        }
        return true;
    }

    // UserDetail과의 양방향 관계 설정 헬퍼
    public void setUserDetail(UserDetail userDetail) {
        this.userDetail = userDetail;
        if (userDetail != null && userDetail.getUser() != this) {
            userDetail.setUser(this);
        }
    }
}