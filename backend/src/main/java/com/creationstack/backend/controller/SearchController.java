package com.creationstack.backend.controller;

import com.creationstack.backend.dto.search.IntegratedSearchResponse;
import com.creationstack.backend.dto.search.SearchDto;
import com.creationstack.backend.dto.search.SearchResponse;
import com.creationstack.backend.dto.search.SearchResultDto;
import com.creationstack.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class SearchController { // 검색 api 컨트롤러

    private final SearchService searchService;

    // 통합 검색(콘텐츠 + 크리에이터)
    @GetMapping("/search")
    public IntegratedSearchResponse search(
            @ModelAttribute SearchDto dto, // 검색 조건
            @RequestParam(value = "sort", defaultValue = "createdAt") String sortType) { // 정렬 조건

        return searchService.searchIntegrated(dto, sortType);
    }

    // 콘텐츠 검색(제목 + 내용)
    @GetMapping("/contents")
    public SearchResponse<SearchResultDto> searchContent(
            @ModelAttribute SearchDto dto, // 검색 조건
            @PageableDefault(size = 9) Pageable pageable, // 페이징
            @RequestParam(value = "sort", defaultValue = "createdAt") String sortType) { // 정렬 조건

        return searchService.searchContent(dto, pageable, sortType);
    }

    // 크리에이터 검색(닉네임 + 직업)
    @GetMapping("/creators")
    public SearchResponse<SearchResultDto> searchCreator(
            @ModelAttribute SearchDto dto, // 검색 조건
            @PageableDefault(size = 9) Pageable pageable, // 페이징
            @RequestParam(value = "sort", defaultValue = "createdAt") String sortType) { // 정렬 조건

        return searchService.searchCreator(dto, pageable, sortType);
    }
}
