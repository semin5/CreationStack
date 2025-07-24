package com.creationstack.backend.domain.content; // 실제 프로젝트 패키지 경로로 변경
import com.creationstack.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "content")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "content_id")
    private Long contentId;

    @ManyToOne(fetch = FetchType.LAZY) // 다대일 관계: 여러 콘텐츠가 하나의 크리에이터에 속함
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator; // 콘텐츠를 생성한 크리에이터 (User 엔티티와 매핑)

    @Column(nullable = false, length = 255) // null 불가능, 최대 길이 255
    private String title; // 콘텐츠 제목

    @Column(nullable = false, columnDefinition = "TEXT") // null 불가능, TEXT 타입으로 지정
    private String content; // 콘텐츠 내용

    @Column(name = "thumbnail_url", nullable = false, length = 512) // null 불가능, 최대 길이 512
    private String thumbnailUrl; // 썸네일 이미지 URL

    @Column(name = "view_count", nullable = false) // null 불가능
    private int viewCount; // 조회수

    @Column(name = "like_count", nullable = false) // null 불가능
    private int likeCount; // 좋아요 수

    @Column(name = "comment_count", nullable = false) // null 불가능
    private int commentCount; // 댓글 수

    @CreationTimestamp // 엔티티가 생성될 때 현재 시간 자동 삽입
    @Column(name = "created_at", nullable = false, updatable = false) // null 불가능, 업데이트 불가능
    private LocalDateTime createdAt; // 생성 일시

    @UpdateTimestamp // 엔티티가 업데이트될 때 현재 시간 자동 삽입
    @Column(name = "updated_at") // null 가능 (초기 생성 시 null, 업데이트 시 값 할당)
    private LocalDateTime updatedAt; // 마지막 수정 일시

    @Enumerated(EnumType.STRING) // Enum 타입을 데이터베이스에 문자열로 저장
    @Column(name = "access_type", nullable = false, length = 10) // null 불가능, 최대 길이 10
    private AccessType accessType; // 접근 타입 (FREE, SUBSCRIBER)

    // 콘텐츠와 카테고리 간의 다대다 관계 설정
    // ContentCategoryMapping 엔티티를 통해 조인 테이블 관리
    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default // Builder 사용 시 기본값 설정
    private Set<ContentCategoryMapping> categoryMappings = new HashSet<>();

     // attachments 필드에 대한 getter/setter가 Lombok에 의해 생성되도록 @Getter/@Setter 어노테이션이 클래스 레벨에 있으므로 별도 필드 레벨 어노테이션은 필요 없음
    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Attachment> attachments = new HashSet<>(); // HashSet으로 초기화

    //콘텐츠 좋아요
    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ContentLike> likes = new ArrayList<>();

    
    /**
     * 조회수를 1 증가시키는 메서드입니다.
     */
    public void incrementViewCount() {
        this.viewCount++;
    }

    public void update(String title, String content, String thumbnailUrl, AccessType accessType, Set<ContentCategory> updatedCategories) {
        this.title = title;
        this.content = content;
        this.thumbnailUrl = thumbnailUrl;
        this.accessType = accessType;
        // 기존 카테고리 매핑 제거 후 새로운 카테고리 매핑 추가
        this.categoryMappings.clear();
        updatedCategories.forEach(category ->
            this.categoryMappings.add(ContentCategoryMapping.builder()
                .content(this)
                .category(category)
                .build())
        );
    }
}
