package com.creationstack.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.creationstack.backend.domain.notice.Notice;
import com.creationstack.backend.domain.notice.NoticeReaction;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.notice.NoticeReactionDto;
import com.creationstack.backend.repository.NoticeReactionRepository;
import com.creationstack.backend.repository.NoticeRepository;
import com.creationstack.backend.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoticeReactionService {

	private final NoticeRepository noticeRepository;
	private final UserRepository userRepository;
	private final NoticeReactionRepository reactionRepository;

	@Transactional
	public void toggleReaction(Long noticeId, Long userId, String emoji) {
		Notice notice = noticeRepository.findById(noticeId).orElseThrow(() -> new EntityNotFoundException("공지 없음"));

		User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("사용자 없음"));

		Optional<NoticeReaction> existing = reactionRepository.findByNoticeAndUser(notice, user);

		if (existing.isPresent()) {
			NoticeReaction reaction = existing.get();
			if (reaction.getEmoji().equals(emoji)) {
				reactionRepository.delete(reaction);
			} else {
				reaction.setEmoji(emoji);
				reaction.setReactedAt(LocalDateTime.now());
			}
		} else {
			NoticeReaction reaction = new NoticeReaction(notice, user, emoji);
			reactionRepository.save(reaction);
		}
	}
	
	@Transactional
	public List<NoticeReactionDto> getReactions(Long noticeId, Long userId) {
	    Notice notice = noticeRepository.findById(noticeId)
	            .orElseThrow(() -> new EntityNotFoundException("공지 없음"));

	    User user = userRepository.findById(userId)
	            .orElseThrow(() -> new EntityNotFoundException("사용자 없음"));

	    List<NoticeReactionDto> reactions = reactionRepository.findGroupedByEmoji(notice);

	    Optional<NoticeReaction> myReactionOpt = reactionRepository.findByNoticeAndUser(notice, user);
			log.info("myReactionOpt = {}", myReactionOpt);
	    String myEmoji = myReactionOpt.map(NoticeReaction::getEmoji).orElse(null);

	    for (NoticeReactionDto dto : reactions) {
	        dto.setReacted(dto.getEmoji().equals(myEmoji));
	    }
		log.info("reactions: {}", reactions.size());
	    return reactions;
	}

}
