package com.creationstack.backend.dto.search;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SearchResponse<T> { // 검색 결과 응답 객체
    private int page; // 페이지 수
    private int size; // 페이지당 콘텐츠 수
    private int totalPages; // 총 페이지 수
    private long totalElements; // 총 검색 결과 개수
    private List<T> contents; // 콘텐츠 리스트
}
