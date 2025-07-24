package com.creationstack.backend.domain.content;
import jakarta.persistence.*;
import lombok.*;

//첨부파일 정보를 나타내는 엔티티 클래스입니다.
@Entity
@Table(name = "attachment")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Long attachmentId; // 첨부파일 ID

    @ManyToOne(fetch = FetchType.LAZY) // 다대일 관계: 여러 첨부파일이 하나의 콘텐츠에 속함
    @JoinColumn(name = "content_id", nullable = false) // 외래 키 컬럼 지정
    private Content content; // 첨부파일이 속한 콘텐츠

    @Column(name = "file_url", nullable = false, length = 512)
    private String fileUrl; // 파일 저장 경로 (S3 URL 등)

    @Column(name = "original_file_name", length = 100)
    private String originalFileName; // 원본 파일명

    @Column(name = "stored_file_name", nullable = false, length = 255)
    private String storedFileName; // 저장된 파일명 (UUID 등)

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType; // 파일 MIME 타입 (예: image/jpeg, application/pdf)

    @Column(name = "file_size")
    private Long fileSize; // 파일 크기 (바이트)
}
