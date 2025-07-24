package com.creationstack.backend.controller.content;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.creationstack.backend.service.FileStorageService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Toast UI Editor에서 이미지 업로드를 처리하는 REST 컨트롤러입니다.
 */
@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/upload") // 이미지 업로드 엔드포인트 기본 경로
public class ImageUploadController {

    private final FileStorageService fileStorageService;

    /**
     * Toast UI Editor에서 업로드되는 이미지를 처리합니다.
     * 에디터는 이미지 업로드 후 JSON 응답으로 이미지 URL을 기대합니다.
     *
     * @param image 업로드할 이미지 파일
     * @return 업로드된 이미지의 URL을 포함하는 JSON 응답
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadEditorImage(@RequestParam("image") MultipartFile image) {
        try {
            // "editor-images" 디렉토리에 이미지 저장
            String imageUrl = fileStorageService.uploadFile(image, "editor-images");

            // Toast UI Editor가 기대하는 JSON 형식으로 응답
            // { "imageUrl": "업로드된 이미지 URL" }
            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);

            log.info("Editor image uploaded successfully: {}", imageUrl);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Failed to upload editor image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("이미지 업로드에 실패했습니다: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("Invalid image upload request", e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 프로필 수정할때 사용할 메서드
    @PostMapping("/profile-image")
    public ResponseEntity<?> uploadProfileImage(@RequestParam("image") MultipartFile image) {
        try {
            String imageUrl = fileStorageService.uploadFile(image, "profile-images");

            Map<String, String> response = new HashMap<>();
            response.put("imageUrl", imageUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload profile image", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("프로필 이미지 업로드 실패");
        }
    }
}
