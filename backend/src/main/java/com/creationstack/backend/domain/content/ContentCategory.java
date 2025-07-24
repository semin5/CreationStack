package com.creationstack.backend.domain.content;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "category") // 데이터베이스 테이블 이름 지정
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ContentCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer categoryId; // 카테고리 ID

    @Column(nullable = false, unique = true, length = 50)
    private String name; // 카테고리 이름 (예: 개발, 디자인)

    // 카테고리 이름으로 동등성 비교를 위한 equals/hashCode 오버라이드
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ContentCategory that = (ContentCategory) o;
        return name.equals(that.name);
    }

    @Override
    public int hashCode() {
        return name.hashCode();
    }
}
