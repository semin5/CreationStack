package com.creationstack.backend.dto.content;
import com.creationstack.backend.domain.content.Attachment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 첨부파일 정보를 클라이언트에게 응답하기 위한 DTO입니다.

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttachmentResponse {
    private Long attachmentId;
    private String fileUrl;
    private String originalFileName;
    private String fileType;
    private Long fileSize;

    /**
     * Attachment 엔티티로부터 AttachmentResponse DTO를 생성하는 정적 팩토리 메서드입니다.
     * @param attachment Attachment 엔티티
     * @return AttachmentResponse DTO
     */
    public static AttachmentResponse from(Attachment attachment) {
        return AttachmentResponse.builder()
                .attachmentId(attachment.getAttachmentId())
                .fileUrl(attachment.getFileUrl())
                .originalFileName(attachment.getOriginalFileName())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .build();
    }
}

