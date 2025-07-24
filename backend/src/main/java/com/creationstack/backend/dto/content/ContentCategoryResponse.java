package com.creationstack.backend.dto.content;
import com.creationstack.backend.domain.content.ContentCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 콘텐츠 카테고리 정보를 클라이언트에게 응답하기 위한 DTO입니다.

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentCategoryResponse {
    private Integer categoryId;
    private String name;

    /**
     * ContentCategory 엔티티로부터 ContentCategoryResponse DTO를 생성하는 정적 팩토리 메서드입니다.
     * @param category ContentCategory 엔티티
     * @return ContentCategoryResponse DTO
     */
    public static ContentCategoryResponse from(ContentCategory category) {
        return ContentCategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .name(category.getName())
                .build();
    }
}

