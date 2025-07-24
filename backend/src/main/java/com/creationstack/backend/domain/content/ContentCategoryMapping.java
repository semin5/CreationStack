package com.creationstack.backend.domain.content;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable; // 복합 키를 위한 Serializable 임포트

@Entity
@Table(name = "content_category") // 데이터베이스 테이블 이름 지정
@IdClass(ContentCategoryMapping.ContentCategoryMappingId.class) // 복합 키 클래스 지정
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContentCategoryMapping {

    @Id // 복합 키의 첫 번째 부분
    @ManyToOne(fetch = FetchType.LAZY) // 다대일 관계: 여러 매핑이 하나의 콘텐츠에 속함
    @JoinColumn(name = "content_id", nullable = false) // 외래 키 컬럼 지정
    private Content content; // 매핑된 콘텐츠

    @Id // 복합 키의 두 번째 부분
    @ManyToOne(fetch = FetchType.LAZY) // 다대일 관계: 여러 매핑이 하나의 카테고리에 속함
    @JoinColumn(name = "category_id", nullable = false) // 외래 키 컬럼 지정
    private ContentCategory category; // 매핑된 카테고리

    /**
     * ContentCategoryMapping의 복합 키를 정의하는 클래스입니다.
     * Serializable을 구현하고 equals()와 hashCode()를 오버라이드해야 합니다.
     */
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode // Lombok: equals와 hashCode 자동 생성
    public static class ContentCategoryMappingId implements Serializable {
        private Long content; // Content 엔티티의 contentId와 매핑
        private Integer category; // ContentCategory 엔티티의 categoryId와 매핑
    }
}

