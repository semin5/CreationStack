package com.creationstack.backend.service.notice;

import com.creationstack.backend.domain.notice.Notice;
import com.creationstack.backend.domain.notice.NoticeReaction;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.notice.*;
import com.creationstack.backend.repository.NoticeReactionRepository;
import com.creationstack.backend.repository.NoticeRepository;
// import com.creationstack.backend.repository.UserRepository;

import com.creationstack.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class NoticeServiceImpl implements NoticeService {

        private final NoticeRepository noticeRepository;
        private final NoticeReactionRepository reactionRepository;
        private final UserRepository userRepository;
        // private final UserRepository userRepository;

        public NoticeResponseDto createNotice(NoticeCreateDto dto, Long userId) {
                User user = getCurrentUser(userId);
                if (user.getRole() != User.UserRole.CREATOR) {
                        throw new AccessDeniedException("공지사항은 크리에이터만 작성할 수 있습니다.");
                }
                Notice notice = Notice.builder()
                                .creator(user)
                                .content(dto.getContent())
                                .thumbnailUrl(dto.getThumbnailUrl())
                                .createdAt(LocalDateTime.now())
                                .build();

                noticeRepository.save(notice);

                return NoticeResponseDto.builder()
                                .noticeId(notice.getNoticeId())
                                .content(notice.getContent())
                                .thumbnailUrl(notice.getThumbnailUrl())
                                .creatorName(user.getUserDetail().getNickname())
                                .createdAt(notice.getCreatedAt())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public NoticeDetailDto getNotice(Long noticeId,Long userId) {
                User user = getCurrentUser(userId);

                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new EntityNotFoundException("공지사항 없음"));

                List<NoticeReaction> allReactions = reactionRepository.findByNotice(notice);

                Map<String, Long> grouped = allReactions.stream()
                                .collect(Collectors.groupingBy(NoticeReaction::getEmoji, Collectors.counting()));

                List<NoticeReactionDto> summary = grouped.entrySet().stream()
                                .map(e -> new NoticeReactionDto(e.getKey(), e.getValue()))
                                .collect(Collectors.toList());

                String userEmoji = allReactions.stream()
                                .filter(r -> r.getUser().getUserId().equals(user.getUserId())) // ✅ 수정
                                .map(NoticeReaction::getEmoji)
                                .findFirst()
                                .orElse(null);

                return NoticeDetailDto.from(notice, summary, userEmoji);
        }

        @Override
        public List<NoticeResponseDto> getAllNotices(Long creatorId) {
                return noticeRepository.findByCreator_UserIdOrderByCreatedAtDesc(creatorId).stream()
                    .map(notice -> NoticeResponseDto.builder()
                        .noticeId(notice.getNoticeId())
                        .content(notice.getContent())
                        .thumbnailUrl(notice.getThumbnailUrl())
                        .creatorName(notice.getCreator().getUserDetail().getNickname())
                        .createdAt(notice.getCreatedAt())
                        .build())
                    .collect(Collectors.toList());
        }

        @Override
        public NoticeResponseDto updateNotice(Long noticeId, NoticeUpdateDto dto, Long userId) {
                User user = getCurrentUser(userId);

                if (user.getRole() != User.UserRole.CREATOR) {
                        throw new AccessDeniedException("공지사항은 크리에이터만 수정할 수 있습니다.");
                }

                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new EntityNotFoundException("공지사항 없음"));

                // 본인이 쓴 글만 수정 가능
                if (!notice.getCreator().getUserId().equals(user.getUserId())) {
                        throw new AccessDeniedException("본인이 작성한 공지만 수정할 수 있습니다.");
                }

                notice.setContent(dto.getContent());
                notice.setThumbnailUrl(dto.getThumbnailUrl());

                return NoticeResponseDto.builder()
                                .noticeId(notice.getNoticeId())
                                .content(notice.getContent())
                                .thumbnailUrl(notice.getThumbnailUrl())
                                .creatorName(notice.getCreator().getUserDetail().getNickname())
                                .createdAt(notice.getCreatedAt())
                                .build();
        }

        @Override
        public void deleteNotice(Long noticeId, Long userId) {
                User user = getCurrentUser(userId);

                if (user.getRole() != User.UserRole.CREATOR) {
                        throw new AccessDeniedException("공지사항은 크리에이터만 삭제할 수 있습니다.");
                }

                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new EntityNotFoundException("공지사항 없음"));

                if (!notice.getCreator().getUserId().equals(user.getUserId())) {
                        throw new AccessDeniedException("본인이 작성한 공지만 삭제할 수 있습니다.");
                }

                reactionRepository.deleteByNotice(notice);
                noticeRepository.delete(notice);
        }

        @Override
        public void reactToNotice(Long noticeId, Long userId, String emoji) {
                return;
        }

        public void reactToNotice(Long noticeId, User user, String emoji) {
                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new EntityNotFoundException("공지사항 없음"));

                Optional<NoticeReaction> existing = reactionRepository.findByNoticeAndUser(notice, user);
                existing.ifPresentOrElse(
                                r -> r.setEmoji(emoji),
                                () -> reactionRepository.save(new NoticeReaction(notice, user, emoji)));
        }

        @Override
        public List<NoticeReactionDto> getReactions(Long noticeId) {
                Notice notice = noticeRepository.findById(noticeId)
                                .orElseThrow(() -> new EntityNotFoundException("공지사항 없음"));

                Map<String, Long> grouped = reactionRepository.findByNotice(notice).stream()
                                .collect(Collectors.groupingBy(NoticeReaction::getEmoji, Collectors.counting()));

                return grouped.entrySet().stream()
                                .map(e -> new NoticeReactionDto(e.getKey(), e.getValue()))
                                .collect(Collectors.toList());
        }


        private User getCurrentUser(Long userId) {
                User user = userRepository.findById(userId).orElse(null);
                return user;
        }
}
