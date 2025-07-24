package com.creationstack.backend.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service; // CustomException 임포트
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.creationstack.backend.domain.content.AccessType;
import com.creationstack.backend.domain.content.Attachment;
import com.creationstack.backend.domain.content.Content;
import com.creationstack.backend.domain.content.ContentCategory; // FileStorageService 임포트
import com.creationstack.backend.domain.content.ContentCategoryMapping;
import com.creationstack.backend.domain.content.ContentLike;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.content.ContentCreateRequest;
import com.creationstack.backend.dto.content.ContentList;
import com.creationstack.backend.dto.content.ContentResponse;
import com.creationstack.backend.dto.content.ContentUpdateRequest; // HttpStatus 임포트
import com.creationstack.backend.exception.CustomException;
import com.creationstack.backend.repository.UserRepository;
import com.creationstack.backend.repository.content.AttachmentRepository;
import com.creationstack.backend.repository.content.ContentCategoryRepository;
import com.creationstack.backend.repository.content.ContentLikeRepository;
import com.creationstack.backend.repository.content.ContentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 콘텐츠 관련 비즈니스 로직을 처리하는 서비스 클래스입니다.
 * 콘텐츠 생성, 조회, 수정, 삭제 기능을 제공합니다.
 */
@Slf4j
@RequiredArgsConstructor // final 필드에 대한 생성자를 자동으로 생성하여 의존성 주입
@Service
@Transactional(readOnly = true)
public class ContentService {

    private final ContentRepository contentRepository;
    private final UserRepository userRepository;
    private final ContentCategoryRepository contentCategoryRepository;
    private final AttachmentRepository attachmentRepository;
    private final FileStorageService fileStorageService; // S3 연동을 위한 FileStorageService 주입
    private final ContentLikeRepository likeRepository;
    private final SubscriptionService subscriptionService;
    private final ContentLikeRepository contentLikeRepository;

    // 콘텐츠 생성
    @Transactional // 쓰기 작업이므로 트랜잭션 적용
    public ContentResponse createContent(ContentCreateRequest request, Long userId) {
        // 1. 유저 확인
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "크리에이터를 찾을 수 없습니다. ID: " + userId));

        // 2. 썸네일 이미지 처리
        String thumbnailUrl = null;
        if (request.getThumbnailFile() != null && !request.getThumbnailFile().isEmpty()) {
            try {
                thumbnailUrl = fileStorageService.uploadFile(request.getThumbnailFile(), "thumbnails");
            } catch (IOException e) {
                log.error("썸네일 업로드 실패", e);
                throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "썸네일 업로드에 실패했습니다.", e);
            }
        }
        // 3. Content 엔티티 생성
        Content content = Content.builder()
                .creator(user)
                .title(request.getTitle())
                .content(request.getContent())
                .thumbnailUrl(thumbnailUrl) // 실제 S3 URL 사용
                .accessType(request.getAccessType())
                .viewCount(0)
                .likeCount(0)
                .commentCount(0)
                .build();

        // 4. 카테고리 매핑 처리
        Set<ContentCategory> categories = request.getCategoryNames().stream()
                .map(categoryName -> contentCategoryRepository.findByName(categoryName)
                        .orElseGet(() -> { // 존재하지 않는 카테고리인 경우 새로 생성 (운영에서는 미리 정의된 카테고리만 허용할 수 있음)
                            log.warn("존재하지 않는 카테고리입니다. 새로 생성: {}", categoryName);
                            return contentCategoryRepository.save(ContentCategory.builder().name(categoryName).build());
                        }))
                .collect(Collectors.toSet());

        categories.forEach(category -> content.getCategoryMappings().add(ContentCategoryMapping.builder()
                .content(content)
                .category(category)
                .build()));

        // 5. Content 저장
        Content savedContent = contentRepository.save(content);

        // 6. 첨부파일 처리
        if (request.getAttachmentFiles() != null && !request.getAttachmentFiles().isEmpty()) {
            List<Attachment> attachments = request.getAttachmentFiles().stream()
                    .map(file -> {
                        String fileUrl = null;
                        String storedFileName = UUID.randomUUID().toString(); // S3에 저장될 고유 파일명
                        try {
                            fileUrl = fileStorageService.uploadFile(file, "attachments");
                            // S3 URL에서 실제 저장된 파일명 (UUID) 추출. UUID는 이미 파일명에 포함되어 있음.
                            // 여기서는 S3에 저장된 파일의 고유한 이름 (UUID-originalFileName)을 storedFileName으로 사용.
                            storedFileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                        } catch (IOException e) {
                            log.error("첨부파일 업로드 실패: {}", ((MultipartFile) file).getOriginalFilename(), e);
                            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "첨부파일 업로드에 실패했습니다.", e);
                        }

                        return Attachment.builder()
                                .content(savedContent)
                                .fileUrl(fileUrl) // 실제 S3 URL 사용
                                .originalFileName(file.getOriginalFilename())
                                .storedFileName(storedFileName) // 실제 S3에 저장된 파일명 (UUID 포함)
                                .fileType(file.getContentType())
                                .fileSize(file.getSize())
                                .build();
                    })
                    .collect(Collectors.toList());
            attachmentRepository.saveAll(attachments);
            // Content 엔티티에 첨부파일 목록 설정 (ContentResponse 생성을 위해)
            savedContent.setAttachments(new HashSet<>(attachments)); // Set으로 변환하여 할당
        } else {
            savedContent.setAttachments(Collections.emptySet());
        }

        log.info("콘텐츠 생성 완료: {}", savedContent.getContentId());
        return ContentResponse.from(savedContent);
    }

    // 특정 콘텐츠 조회 (콘텐츠 상세보기)
    @Transactional // 조회수 증가로 인해 쓰기 트랜잭션 필요
    public ContentResponse getContentById(Long contentId, Long userId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "콘텐츠를 찾을 수 없습니다. ID: " + contentId));

        // 구독자 전용 콘텐츠일 경우, 권한 확인
        if (content.getAccessType() == AccessType.SUBSCRIBER) {
            log.info("구독자 전용 콘텐츠 조회");
            boolean isSubscribed = subscriptionService.isActiveSubscriber(content.getCreator().getUserId(), userId);

            if (!isSubscribed && !content.getCreator().getUserId().equals(userId)) {
                log.info("구독자 아님 X => 접근 불가");
                throw new CustomException(HttpStatus.FORBIDDEN, "구독자가 아니므로 콘텐츠 접근 불가.");
            }
        }

        log.info("조회 성공");
        content.incrementViewCount(); // 조회수 증가
        // contentRepository.save(content); // @Transactional 어노테이션이 있으면 변경 감지(Dirty
        // Checking)로 자동 저장됨

        log.info("콘텐츠 조회 및 조회수 증가: Content ID = {}", contentId);

        boolean isLiked = false;
        if (userId != null) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다. ID: " + userId));

            isLiked = contentLikeRepository.findByUserAndContent(user, content)
                    .filter(ContentLike::getIsActive)
                    .isPresent();
        }

        return ContentResponse.from(content, isLiked);
    }

    // 콘텐츠 목록 조회
    public List<ContentResponse> getContentsByCreator(Long creatorId, Long excludeContentId) {
        if (!userRepository.existsById(creatorId)) {
            throw new CustomException(HttpStatus.NOT_FOUND, "크리에이터를 찾을 수 없습니다. ID: " + creatorId);
        }

        List<Content> contents;
        if (excludeContentId != null) {
            // 특정 contentId를 제외하고 조회
            contents = contentRepository.findByCreator_UserIdAndContentIdNot(creatorId, excludeContentId);
            log.info("크리에이터 ID {} 의 콘텐츠 (제외 ID: {}) {}개 조회", creatorId, excludeContentId, contents.size());
        } else {
            // 모든 콘텐츠 조회
            contents = contentRepository.findByCreator_UserId(creatorId);
            log.info("크리에이터 ID {} 의 콘텐츠 {}개 조회", creatorId, contents.size());
        }
        return contents.stream()
                .map(ContentResponse::from)
                .collect(Collectors.toList());
    }

    // 콘텐츠 수정
    @Transactional // 쓰기 작업이므로 트랜잭션 적용
    public ContentResponse updateContent(Long contentId, ContentUpdateRequest request, Long userId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "콘텐츠를 찾을 수 없습니다. ID: " + contentId));

        // 1. 권한 확인: 콘텐츠 작성자와 수정 요청자가 동일한지 확인
        if (!content.getCreator().getUserId().equals(userId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "콘텐츠를 수정할 권한이 없습니다.");
        }

        // 2. 썸네일 이미지 처리
        String newThumbnailUrl = content.getThumbnailUrl(); // 현재 콘텐츠의 썸네일 URL로 초기화

        if (request.getNewThumbnailFile() != null && !request.getNewThumbnailFile().isEmpty()) {
            // 새 썸네일 파일이 있으면 기존 썸네일 삭제 후 업로드
            if (newThumbnailUrl != null) { // 기존 썸네일이 존재하면 S3에서 삭제
                fileStorageService.deleteFile(newThumbnailUrl);
            }
            try {
                newThumbnailUrl = fileStorageService.uploadFile(request.getNewThumbnailFile(), "thumbnails");
            } catch (IOException e) {
                log.error("새 썸네일 업로드 실패", e);
                throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "새 썸네일 업로드에 실패했습니다.", e);
            }
        } else {
            // 새 썸네일 파일이 없는 경우
            if (request.getExistingThumbnailUrl() != null) {
                // request.getExistingThumbnailUrl()이 명시적으로 제공된 경우
                if (request.getExistingThumbnailUrl().isEmpty()) {
                    // 클라이언트가 썸네일 제거를 명시적으로 요청 (빈 문자열)
                    if (content.getThumbnailUrl() != null) { // 기존 썸네일이 있었다면 S3에서 삭제
                        fileStorageService.deleteFile(content.getThumbnailUrl());
                    }
                    throw new CustomException(HttpStatus.BAD_REQUEST, "썸네일 URL은 필수입니다. 빈 값으로 설정할 수 없습니다.");
                } else {
                    // 클라이언트가 기존 썸네일 URL을 유지하거나 변경 요청 (파일 업로드 없이 URL만 변경)
                    // 이 경우, S3에 이미 존재하는 URL이라고 가정하고 그대로 사용합니다.
                    newThumbnailUrl = request.getExistingThumbnailUrl();
                }
            }
        }

        // 3. 콘텐츠 핵심 정보 및 카테고리 매핑 업데이트
        Set<ContentCategory> categoriesToUpdate = new HashSet<>();
        if (request.getCategoryNames() != null && !request.getCategoryNames().isEmpty()) {
            for (String categoryName : request.getCategoryNames()) {
                ContentCategory category = contentCategoryRepository.findByName(categoryName)
                        .orElseGet(() -> contentCategoryRepository
                                .save(ContentCategory.builder().name(categoryName).build()));
                categoriesToUpdate.add(category);
            }
        }

        // 4. 첨부파일 처리 (수정된 부분)
        // 기존 첨부파일 중 유지할 파일 ID 목록
        Set<Long> existingAttachmentIdsToKeep = request.getExistingAttachmentIds() != null
                ? new HashSet<>(request.getExistingAttachmentIds())
                : new HashSet<>();

        // 삭제할 첨부파일을 임시로 담을 리스트
        List<Attachment> attachmentsToDeleteFromCollection = new ArrayList<>();

        // 기존 첨부파일을 순회하며 삭제할 파일 식별
        if (content.getAttachments() != null) {
            for (Attachment existingAttachment : content.getAttachments()) {
                if (!existingAttachmentIdsToKeep.contains(existingAttachment.getAttachmentId())) {
                    attachmentsToDeleteFromCollection.add(existingAttachment);
                    fileStorageService.deleteFile(existingAttachment.getFileUrl()); // S3에서 파일 삭제
                }
            }
        }

        // 식별된 첨부파일들을 Content 엔티티의 컬렉션에서 제거
        // Content 엔티티의 @OneToMany(orphanRemoval=true) 설정으로 인해 이 제거가 DB 삭제로 이어집니다.
        content.getAttachments().removeAll(attachmentsToDeleteFromCollection);

        // 새로 추가될 첨부파일 처리
        if (request.getNewAttachmentFiles() != null && !request.getNewAttachmentFiles().isEmpty()) {
            for (MultipartFile file : request.getNewAttachmentFiles()) {
                if (!file.isEmpty()) {
                    String fileUrl = null;
                    String storedFileName = null; // 초기화
                    try {
                        fileUrl = fileStorageService.uploadFile(file, "attachments");
                        storedFileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
                    } catch (IOException e) {
                        log.error("새 첨부파일 업로드 실패: {}", file.getOriginalFilename(), e);
                        throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "새 첨부파일 업로드에 실패했습니다.", e);
                    }
                    Attachment newAttachment = Attachment.builder()
                            .content(content) // 연관관계 설정
                            .fileUrl(fileUrl)
                            .originalFileName(file.getOriginalFilename())
                            .storedFileName(storedFileName)
                            .fileType(file.getContentType())
                            .fileSize(file.getSize())
                            .build();
                    // Content 엔티티의 컬렉션에 새 첨부파일 추가
                    // Content 엔티티의 @OneToMany(cascade=CascadeType.ALL) 설정으로 인해 이 추가가 DB 저장으로 이어집니다.
                    content.getAttachments().add(newAttachment);
                }
            }
        }
        // 5. Content 엔티티의 update 메서드 호출
        content.update(
                request.getTitle(),
                request.getContent(),
                newThumbnailUrl,
                request.getAccessType(),
                categoriesToUpdate);
        // 6. 저장
        log.info("콘텐츠 수정 완료: {}", contentId);
        Content updatedContent = contentRepository.save(content);
        return ContentResponse.from(updatedContent);
    }

    // 콘텐츠 삭제
    @Transactional // 쓰기 작업이므로 트랜잭션 적용
    public void deleteContent(Long contentId, Long userId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "콘텐츠를 찾을 수 없습니다. ID: " + contentId));

        // 1. 권한 확인: 콘텐츠 작성자와 삭제 요청자가 동일한지 확인
        if (!content.getCreator().getUserId().equals(userId)) {
            throw new CustomException(HttpStatus.FORBIDDEN, "콘텐츠를 삭제할 권한이 없습니다.");
        }

        // 2. 관련 첨부파일 S3 및 DB에서 삭제
        Set<Attachment> attachments = content.getAttachments(); // Content 엔티티에서 현재 첨부파일 가져옴
        attachments.forEach(att -> fileStorageService.deleteFile(att.getFileUrl())); // S3에서 파일 삭제
        attachmentRepository.deleteAll(attachments); // DB에서 첨부파일 삭제 (Content의 cascade 설정으로 자동 삭제될 수도 있지만 명시적으로 처리)

        // 3. 콘텐츠 삭제 (ContentCategoryMapping은 Content 엔티티의 cascade 설정으로 자동 삭제됨)
        contentRepository.delete(content);
        log.info("콘텐츠 삭제 완료: {}", contentId);
    }

    // 특정 크리에이터의 조회수 TOP N 콘텐츠를 조회합니다.
    public List<ContentResponse> getTopViewedContents(Long creatorId, int limit) {
        if (!userRepository.existsById(creatorId)) {
            throw new CustomException(HttpStatus.NOT_FOUND, "크리에이터를 찾을 수 없습니다. ID: " + creatorId);
        }
        // 몇개 콘텐츠 조회할지 메서드 이름에 직접 명시하여 동적으로 처리가능
        List<Content> topContents = contentRepository.findTop3ByCreator_UserIdOrderByViewCountDesc(creatorId);
        log.info("크리에이터 ID {} 의 조회수 TOP {} 콘텐츠 {}개 조회", creatorId, limit, topContents.size());
        return topContents.stream()
                .map(ContentResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void initializeCategories(Set<String> categoryNames) {
        categoryNames.forEach(name -> {
            if (contentCategoryRepository.findByName(name).isEmpty()) {
                contentCategoryRepository.save(ContentCategory.builder().name(name).build());
                log.info("카테고리 초기화: {}", name);
            }
        });
    }

    // 콘텐츠 좋아요/취소
    @Transactional
    public boolean toggleLike(Long contentId, Long userId) {
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "콘텐츠가 존재하지 않습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "사용자가 존재하지 않습니다."));

        Optional<ContentLike> existingLike = likeRepository.findByUserAndContent(user, content);

        boolean isLiked = contentLikeRepository.findByUserAndContent(user, content)
                .filter(ContentLike::getIsActive)
                .isPresent();

        if (existingLike.isPresent()) {
            ContentLike like = existingLike.get();
            boolean wasActive = like.getIsActive();
            like.setIsActive(!wasActive);
            likeRepository.save(like);

            // 좋아요 수 증감
            if (wasActive) {
                content.setLikeCount(content.getLikeCount() - 1);
            } else {
                content.setLikeCount(content.getLikeCount() + 1);
            }
            contentRepository.save(content);

            return like.getIsActive();
        } else {
            ContentLike like = new ContentLike();
            like.setUser(user);
            like.setContent(content);
            like.setIsActive(true);
            likeRepository.save(like);

            content.setLikeCount(content.getLikeCount() + 1);
            contentRepository.save(content);

            return true;
        }
    }

    // 좋아요 콘텐츠 조회
    public Page<ContentList> getLikedContents(Long userId, Pageable pageable) {
        Page<ContentLike> likes = likeRepository.findByUserIdAndIsActiveTrue(userId, pageable);

        System.out.println("총 좋아요 수: " + likes.getTotalElements());

        for (ContentLike like : likes) {
            System.out.println("LIKE ID: " + like.getLikeId());
            System.out.println("CONTENT: " + like.getContent());
        }

        return likes.map(like -> ContentList.from(like.getContent(), true));

    }

}
