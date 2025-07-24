package com.creationstack.backend.dto.content;
import com.creationstack.backend.domain.content.AccessType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Set;

 // 기존 콘텐츠 수정을 위한 요청 DTO. 클라이언트로부터 업데이트할 제목, 내용, 썸네일, 접근 타입, 카테고리, 첨부파일 등을 받습니다.
 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContentUpdateRequest {

    @NotBlank(message = "제목은 필수 입력 항목입니다.")
    @Size(max = 255, message = "제목은 255자를 초과할 수 없습니다.")
    private String title; // 콘텐츠 제목

    @NotBlank(message = "내용은 필수 입력 항목입니다.")
    private String content; // 콘텐츠 내용

    // 썸네일은 변경될 수도, 안 될 수도 있으므로 @NotNull 제거
    private MultipartFile newThumbnailFile; // 새로운 썸네일 이미지 파일 (변경 시)
    private String existingThumbnailUrl; // 기존 썸네일 URL (변경 없을 시)

    @NotNull(message = "구독 여부 설정은 필수입니다.")
    private AccessType accessType; // 접근 타입

    @NotNull(message = "카테고리는 1개 이상 선택해야 합니다.")
    @Size(min = 1, message = "카테고리는 1개 이상 선택해야 합니다.")
    private Set<String> categoryNames; // 선택된 카테고리 이름 목록

    @Size(max = 5, message = "첨부파일은 최대 5개까지 업로드할 수 있습니다.")
    private List<MultipartFile> newAttachmentFiles; // 새로 추가될 첨부파일 목록
    private List<Long> existingAttachmentIds; // 유지할 기존 첨부파일 ID 목록 (삭제되지 않을 파일)
}
