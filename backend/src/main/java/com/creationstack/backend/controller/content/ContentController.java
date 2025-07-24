package com.creationstack.backend.controller.content; // 실제 프로젝트 패키지 경로로 변경

import com.creationstack.backend.dto.content.ContentCreateRequest;
import com.creationstack.backend.dto.content.ContentList;
import com.creationstack.backend.dto.content.ContentResponse;
import com.creationstack.backend.dto.content.ContentUpdateRequest;
import com.creationstack.backend.service.ContentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Null;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
// import org.springframework.security.core.annotation.AuthenticationPrincipal; // @AuthenticationPrincipal 임포트 제거 (임시)
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

import jakarta.annotation.Nullable;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final ContentService contentService;

    // 콘텐츠 생성 요청
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContentResponse> createContent(
            @Valid @ModelAttribute ContentCreateRequest request,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();
        ContentResponse response = contentService.createContent(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 로그인된 사용자의 내 콘텐츠 목록 조회 (로그인 사용자 기준)
    @GetMapping("/my")
    public ResponseEntity<List<ContentResponse>> getMyContents(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();  // JWT 필터에서 설정된 userId
        List<ContentResponse> contents = contentService.getContentsByCreator(userId,null);
        return ResponseEntity.ok(contents);
    }
    // 로그인된 사용자의 내 조회수 top3 콘텐츠 조회
    @GetMapping("/my/top-viewed")
    public ResponseEntity<List<ContentResponse>> getMyTopViewedContents(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        log.info("조회수 TOP 3 콘텐츠 조회 요청 수신");
        List<ContentResponse> topContents = contentService.getTopViewedContents(userId,3);
        return ResponseEntity.ok(topContents);
    }



    // 특정 콘텐츠 조회
    @GetMapping("/{contentId}")
    public ResponseEntity<ContentResponse> getContentById(
            @PathVariable Long contentId,
            @Nullable Authentication authentication
    ) {
        log.info("콘텐츠 조회 요청 수신: Content ID={}", contentId);
        // 비로그인 사용자도 조회 가능
        Long userId = null;
        // 만약 로그인한 사용자라면 id 가져오기
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            userId = (Long) authentication.getPrincipal();
        }

        ContentResponse response = contentService.getContentById(contentId, userId);
        return ResponseEntity.ok(response);
    }

    // 특정 크리에이터의 콘텐츠 목록 조회
    @GetMapping("/creator/{creatorId}")
    public ResponseEntity<List<ContentResponse>> getContentsByCreator(
            @PathVariable Long creatorId,
            @RequestParam(value = "excludeContentId", required = false) Long excludeContentId
    ) {
        log.info("크리에이터 ID {} 의 콘텐츠 목록 조회 요청 수신 (제외할 콘텐츠 ID: {})", creatorId, excludeContentId);
        List<ContentResponse> responses = contentService.getContentsByCreator(creatorId, excludeContentId);
        return ResponseEntity.ok(responses);
    }

    // 특정 콘텐츠 수정
    @PutMapping(value = "/{contentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ContentResponse> updateContent(
            @PathVariable Long contentId,
            @Valid @ModelAttribute ContentUpdateRequest request,
            Authentication authentication
    ) {
        Long creatorId = (Long) authentication.getPrincipal(); // JWT에서 추출된 userId
        log.info("콘텐츠 수정 요청 수신: Content ID={}, 크리에이터 ID={}", contentId, creatorId);

        ContentResponse response = contentService.updateContent(contentId, request, creatorId);
        return ResponseEntity.ok(response);
    }

    // 특정 콘텐츠 삭제
    @DeleteMapping("/{contentId}")
    public ResponseEntity<Void> deleteContent(
            @PathVariable Long contentId,
            Authentication authentication
    ) {
        Long creatorId = (Long) authentication.getPrincipal(); // JWT에서 추출된 userId
        log.info("콘텐츠 삭제 요청 수신: Content ID={}, 크리에이터 ID={}", contentId, creatorId);

        contentService.deleteContent(contentId, creatorId);
        return ResponseEntity.noContent().build();
    }

    // 콘텐츠 좋아요
    @PostMapping("/{contentId}/like")
    public ResponseEntity<String> toggleContentLike(
            @PathVariable Long contentId,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal(); 
        boolean isLiked = contentService.toggleLike(contentId, userId);
        return ResponseEntity.ok(isLiked ? "liked" : "unliked");
    }


    // 좋아요 콘텐츠 목록 조회-페이징
    @GetMapping("/liked")
    public ResponseEntity<?> getLikedContents(
            Authentication authentication,
            @PageableDefault(size = 5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        Long userId = (Long) authentication.getPrincipal(); // 또는 customUserDetails.getUserId()
        Page<ContentList> likedContents = contentService.getLikedContents(userId, pageable);
        return ResponseEntity.ok(likedContents);
    }


    // @PostMapping("/categories/initialize")
    // public ResponseEntity<String> initializeCategories(@RequestBody Set<String>
    // categoryNames) {
    // log.info("카테고리 초기화 요청 수신: {}", categoryNames);
    // contentService.initializeCategories(categoryNames);
    // return ResponseEntity.ok("카테고리 초기화가 완료되었습니다.");
    // }
}
