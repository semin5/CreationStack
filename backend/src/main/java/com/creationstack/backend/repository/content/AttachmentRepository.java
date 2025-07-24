package com.creationstack.backend.repository.content;
import com.creationstack.backend.domain.content.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    // 특정 contentId에 속하는 첨부파일 목록을 찾는 메서드 추가
    List<Attachment> findByContent_ContentId(Long contentId);

    // 특정 contentId에 속하는 첨부파일들을 삭제하는 메서드 추가
    void deleteByContent_ContentId(Long contentId);
}
