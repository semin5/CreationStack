package com.creationstack.backend.repository.content;
import com.creationstack.backend.domain.content.ContentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.Set;

@Repository
public interface ContentCategoryRepository extends JpaRepository<ContentCategory, Integer> {
    // 카테고리 이름으로 카테고리를 찾는 메서드 추가
    Optional<ContentCategory> findByName(String name);

    // 여러 카테고리 이름으로 카테고리 목록을 찾는 메서드 추가
    Set<ContentCategory> findByNameIn(Set<String> names);
}
