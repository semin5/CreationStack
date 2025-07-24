package com.creationstack.backend.dto.search;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class IntegratedSearchResponse { // 크리에이터 + 콘텐츠 검색 결과 Dto
    private List<SearchResultDto> creators; // 크리에이터 검색 결과
    private List<SearchResultDto> contents; // 콘텐츠 검색 결과

}
