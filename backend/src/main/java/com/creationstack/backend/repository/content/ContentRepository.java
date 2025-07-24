package com.creationstack.backend.repository.content;

import com.creationstack.backend.domain.content.Content;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentRepository extends JpaRepository<Content, Long>, JpaSpecificationExecutor<Content> {

    List<Content> findByCreator_UserId(Long creatorId); // 특정 크리에이터 ID로 콘텐츠 목록 조회

    @EntityGraph(attributePaths = {
            "creator", "creator.userDetail", "creator.job", "categoryMappings.category"
    })
    Page<Content> findAll(Specification<Content> spec, Pageable pageable);

    // 특정 크리에이터의 조회수 TOP N 콘텐츠를 조회하는 메서드 추가
    // findTopNBy...OrderBy...Desc 패턴을 사용
    List<Content> findTop3ByCreator_UserIdOrderByViewCountDesc(Long creatorId);

    // 특정 크리에이터의 콘텐츠 중 특정 contentId를 제외하고 조회
    List<Content> findByCreator_UserIdAndContentIdNot(Long creatorId, Long contentId);
}