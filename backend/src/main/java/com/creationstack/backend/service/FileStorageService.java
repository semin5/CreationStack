package com.creationstack.backend.service;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Slf4j // Lombok: 로깅을 위한 Logger 자동 생성
@RequiredArgsConstructor // Lombok: final 필드에 대한 생성자 자동 생성 (의존성 주입)
@Service
public class FileStorageService {

    private final AmazonS3Client amazonS3Client;

    @Value("${cloud.aws.s3.bucket-name}")
    private String bucketName;

    /**
     * 파일을 S3에 업로드하고 해당 파일의 URL을 반환합니다.
     */
    public String uploadFile(MultipartFile multipartFile, String dirName) throws IOException {
        if (multipartFile.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        // 파일 고유 이름 생성 (중복 방지)
        String fileName = dirName + "/" + UUID.randomUUID() + "-" + multipartFile.getOriginalFilename();

        // 파일 메타데이터 설정
        ObjectMetadata objectMetadata = new ObjectMetadata();
        objectMetadata.setContentLength(multipartFile.getSize());
        objectMetadata.setContentType(multipartFile.getContentType());

        try (InputStream inputStream = multipartFile.getInputStream()) {
            // S3에 파일 업로드
            amazonS3Client.putObject(new PutObjectRequest(bucketName, fileName, inputStream, objectMetadata));
            log.info("File uploaded to S3: {}", fileName);
        } catch (IOException e) {
            log.error("Failed to upload file to S3: {}", fileName, e);
            throw new IOException("파일 업로드에 실패했습니다.", e);
        }

        // 업로드된 파일의 URL 반환
        return amazonS3Client.getUrl(bucketName, fileName).toString();
    }

    /**
     * S3에서 파일을 삭제합니다.
     *
     * @param fileUrl 삭제할 파일의 URL
     */
    public void deleteFile(String fileUrl) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1); // URL에서 파일명 추출
            amazonS3Client.deleteObject(bucketName, fileName);
            log.info("File deleted from S3: {}", fileName);
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", fileUrl, e);
            // 파일 삭제 실패는 치명적이지 않을 수 있으므로 예외를 다시 던지지 않을 수도 있습니다.
        }
    }
}
