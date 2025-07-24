package com.creationstack.backend.service;

import com.creationstack.backend.domain.content.Content;
import com.creationstack.backend.domain.content.ContentCategory;
import com.creationstack.backend.domain.content.ContentCategoryMapping;
import com.creationstack.backend.domain.user.Job;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.domain.user.UserDetail;
import com.creationstack.backend.dto.search.*;
import com.creationstack.backend.repository.content.ContentRepository;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService { // 검색 서비스

    private final ContentRepository contentRepository; // 콘텐츠 레포지토리

    // 통합 검색
    public IntegratedSearchResponse searchIntegrated(
            SearchDto dto, // 검색 조건 Dto
            String sortType) { // 정렬 기준

        // 크리에이터 3개
        Pageable creatorPageable = PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, sortType));
        SearchResponse<SearchResultDto> creatorResult = searchCreator(dto, creatorPageable, sortType);
        //콘텐츠 6개
        Pageable contentPageable = PageRequest.of(0, 6, Sort.by(Sort.Direction.DESC, sortType));
        SearchResponse<SearchResultDto> contentResult = searchContent(dto, contentPageable, sortType);

        //결과 묶기
        IntegratedSearchResponse response = new IntegratedSearchResponse();
        response.setCreators(creatorResult.getContents());
        response.setContents(contentResult.getContents());

        return response;
    }

    // 콘텐츠 + 크리에이터의 콘텐츠 검색
    public SearchResponse<SearchResultDto> searchContent(
            SearchDto dto, // 검색 조건 Dto
            Pageable pageable, // 페이징 정보
            String sortType) { // 정렬 기준

        dto.setSearchMode(SearchMode.CONTENT_ONLY);
        return searchFilter(dto, pageable, sortType);
    }

    // 크리에이터 검색
    public SearchResponse<SearchResultDto> searchCreator(
            SearchDto dto, // 검색 조건 Dto
            Pageable pageable, // 페이징 정보
            String sortType) { // 정렬 기준

        dto.setSearchMode(SearchMode.CREATOR_ONLY);
        return searchFilter(dto, pageable, sortType);
    }

    // 검색조건으로 필터링 메소드, ContentSearchResponse<ContentListDto>로 반환
    @Transactional(readOnly = true)
    public SearchResponse<SearchResultDto> searchFilter(
            SearchDto dto, // 검색 조건 Dto
            Pageable pageable, // 페이징 정보
            String sortType) { // 정렬 기준

        // 동적 쿼리를 위한 Specification
        Specification<Content> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>(); // 조건 담는 리스트
            Join<Content, User> creatorJoin = root.join("creator", JoinType.LEFT);
            Join<User, UserDetail> userDetailJoin = creatorJoin.join("userDetail", JoinType.LEFT);
            Join<User, Job> jobJoin = creatorJoin.join("job", JoinType.LEFT);

            // 크리에이터 닉네임, 제목, 내용 통합 키워드 검색
            if (dto.getKeyword() != null && !dto.getKeyword().trim().isEmpty()) {
                // 부분일치 검색을 위한 와일드카드 처리, 공백 제거로 실수 방지
                String keyword = "%" + dto.getKeyword().trim() + "%";

                List<Predicate> keywordPredicates = new ArrayList<>();
                switch (dto.getSearchMode()) { // 검색 모드

                    case CONTENT_ONLY -> { // 콘텐츠 검색
                        keywordPredicates.add(cb.like(root.get("title"), keyword)); // 제목으로 검색
                        keywordPredicates.add(cb.like(root.get("content"), keyword)); // 내용으로 검색
                    }
                    case CREATOR_ONLY -> { // 크리에이터 검색
                        keywordPredicates.add(cb.like(userDetailJoin.get("nickname"), keyword)); // 크리에이터 닉네임으로 검색
                        keywordPredicates.add(cb.like(jobJoin.get("name"), keyword)); // 크리에이터 직업으로 검색
                        query.distinct(true);
                    }
                    case ALL -> { // 통합 검색
                        keywordPredicates.add(cb.like(root.get("title"), keyword)); // 제목으로 검색
                        keywordPredicates.add(cb.like(root.get("content"), keyword)); // 내용으로 검색
                        keywordPredicates.add(cb.like(userDetailJoin.get("nickname"), keyword)); // 크리에이터 닉네임으로 검색
                        keywordPredicates.add(cb.like(jobJoin.get("name"), keyword)); // 크리에이터 직업으로 검색
                    }
                }
                predicates.add(cb.or(keywordPredicates.toArray(new Predicate[0])));
                // 제목, 내용, 닉네임 중 하나라도 키워드 포함이면 검색
                // 직업 키워드 검색 추가
            }

            // 유/무료 조건
            if (dto.getAccessType() != null) {
                predicates.add(cb.equal(root.get("accessType"), dto.getAccessType()));
            }

            // 카테고리 조건
            if (dto.getCategories() != null && !dto.getCategories().isEmpty()) {
                Join<Content, ContentCategoryMapping> mappingJoin = root.join("categoryMappings", JoinType.INNER);
                Join<ContentCategoryMapping, ContentCategory> categoryJoin = mappingJoin.join("category", JoinType.INNER);
                predicates.add(categoryJoin.get("categoryId").in(dto.getCategories()));
            }

            // 모든 조건을 AND로 묶어서 반환
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        // 정렬 조건 커스터마이징
        Sort sort = switch (sortType) {
            case "like" -> Sort.by(Sort.Direction.DESC, "likeCount"); // 좋아요순
            case "createdAt" -> Sort.by(Sort.Direction.DESC, "createdAt"); // 최신순
            default -> Sort.by(Sort.Direction.DESC, "createdAt"); // 기본값 최신순
        };

        // 정렬조건 바꿔서 적용
        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);

        // 조건에 맞는 콘텐츠 리스트를 페이징해서 가져오고 map을 이용해서 Dto로 변환
        Page<SearchResultDto> page = contentRepository.findAll(spec, sortedPageable)
                .map(content -> {
                    SearchCreatorDto creatorDto = Optional.ofNullable(content.getCreator())
                            .map(creator -> SearchCreatorDto.builder()
                                    .userId(creator.getUserId())
                                    .nickname(Optional.ofNullable(creator.getUserDetail()).map(UserDetail::getNickname).orElse(null))
                                    .profileImageUrl(Optional.ofNullable(creator.getUserDetail()).map(UserDetail::getProfileImageUrl).orElse(null))
                                    .job(Optional.ofNullable(creator.getJob()).map(Job::getName).orElse(null))
                                    .bio(Optional.ofNullable(creator.getUserDetail()).map(UserDetail::getBio).orElse(null))
                                    .subscriberCount(creator.getSubscriberCount())
                                    .build())
                            .orElse(null);

                    return SearchResultDto.builder()
                            .contentId(content.getContentId()) // 콘텐츠 ID
                            .title(content.getTitle()) // 제목
                            .creator(creatorDto) // 크리에이터 정보
                            .thumbnailUrl(content.getThumbnailUrl()) // 섬네일 Url
                            .accessType(content.getAccessType()) // 유/무료 여부
                            .viewCount(content.getViewCount()) // 조회수
                            .likeCount(content.getLikeCount()) // 좋아요수
                            .commentCount(content.getCommentCount()) // 댓글수
                            .createdAt(content.getCreatedAt()) // 작성일
                            .categoryNames( // 카테고리 이름 목록
                                    content.getCategoryMappings().stream()
                                            .map(mapping -> mapping.getCategory().getName())
                                            .toList())
                            .categoryIds(
                                    content.getCategoryMappings().stream()
                                            .map(mapping -> mapping.getCategory().getCategoryId())
                                            .toList())
                            .build();
                });

        // Page 객체에서 페이지 정보와 콘텐츠 리스트를 추출하여 SearchResponse로 변환
        if (dto.getSearchMode() == SearchMode.CREATOR_ONLY) {
            // userId 기준 중복 제거
            List<SearchResultDto> distinctList = page.getContent().stream()
                    .collect(Collectors.toMap(
                            dtoItem -> dtoItem.getCreator().getUserId(),
                            dtoItem -> dtoItem,
                            (existing, replacement) -> existing
                    ))
                    .values()
                    .stream()
                    .toList();

            int pageNum = pageable.getPageNumber();
            int pageSize = pageable.getPageSize();
            int total = distinctList.size();

            int fromIndex = pageNum * pageSize;
            int toIndex = Math.min(fromIndex + pageSize, total);

            List<SearchResultDto> pagedList = fromIndex < total
                    ? distinctList.subList(fromIndex, toIndex)
                    : List.of();

            int totalPages = (int) Math.ceil((double) total / pageSize);

            return new SearchResponse<>(
                    pageNum,
                    pageSize,
                    totalPages,
                    total,
                    pagedList
            );
        } else {
            return new SearchResponse<>(
                    page.getNumber(), // 페이지 번호
                    page.getSize(), // 한 페이지에 표시할 콘텐츠 수
                    page.getTotalPages(), // 전체 페이지 수
                    page.getTotalElements(), // 전체 검색 결과 수
                    page.getContent() // 현재 페이지의 콘텐츠 리스트(List<T>)
            );
        }
    }
}
