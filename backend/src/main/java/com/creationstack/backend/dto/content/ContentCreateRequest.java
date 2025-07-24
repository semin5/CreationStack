package com.creationstack.backend.dto.content;
import com.creationstack.backend.domain.content.AccessType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile; // 썸네일 파일 및 첨부파일을 받을 때 사용

import java.util.List;
import java.util.Set;


// 새로운 콘텐츠 생성 요청 DTO. 클라이언트로부터 제목, 내용, 썸네일, 접근 타입, 카테고리, 첨부파일 등을 받습니다.

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentCreateRequest {

    @NotBlank(message = "제목은 필수 입력 항목입니다.") // 제목은 비어있을 수 없음
    @Size(max = 255, message = "제목은 255자를 초과할 수 없습니다.") // 제목 길이 제한
    private String title; // 콘텐츠 제목

    @NotBlank(message = "내용은 필수 입력 항목입니다.") // 내용은 비어있을 수 없음
    private String content; // 콘텐츠 내용 (마크다운/HTML)

    @NotNull(message = "썸네일 이미지는 필수입니다.") // 썸네일 이미지는 필수
    private MultipartFile thumbnailFile; // 썸네일 이미지 파일 (MultipartFile로 받음)

    @NotNull(message = "구독 여부 설정은 필수입니다.") // 접근 타입은 필수
    private AccessType accessType; // 접근 타입 (FREE, SUBSCRIBER)

    @NotNull(message = "카테고리는 1개 이상 선택해야 합니다.") // 카테고리는 필수
    @Size(min = 1, message = "카테고리는 1개 이상 선택해야 합니다.") // 최소 1개 이상의 카테고리 필요
    private Set<String> categoryNames; // 선택된 카테고리 이름 목록 (프론트에서 문자열로 전달)

    @Size(max = 5, message = "첨부파일은 최대 5개까지 업로드할 수 있습니다.") // 첨부파일 최대 5개 제한
    private List<MultipartFile> attachmentFiles; // 첨부파일 목록 (MultipartFile 리스트로 받음)
}
