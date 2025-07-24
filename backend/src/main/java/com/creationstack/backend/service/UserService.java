package com.creationstack.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.creationstack.backend.domain.subscription.SubscriptionStatus;
import com.creationstack.backend.domain.subscription.SubscriptionStatusName;
import com.creationstack.backend.domain.user.Job;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.domain.user.UserDetail;
import com.creationstack.backend.dto.Subscription.SubscriptionCountResponseDto;
import com.creationstack.backend.dto.member.PublicProfileResponse;
import com.creationstack.backend.dto.member.UpdateProfileRequest;
import com.creationstack.backend.dto.member.UserProfileResponse;
import com.creationstack.backend.exception.CustomException;
import com.creationstack.backend.repository.JobRepository;
import com.creationstack.backend.repository.SubscriptionRepository;
import com.creationstack.backend.repository.SubscriptionStatusRepository;
import com.creationstack.backend.repository.UserDetailRepository;
import com.creationstack.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class UserService {

        private final UserRepository userRepository;
        private final JobRepository jobRepository;
        private final PasswordEncoder passwordEncoder;
        private final UserDetailRepository userDetailRepository;
        private final SubscriptionRepository subscriptionRepository;
        private final SubscriptionStatusRepository statusRepository;

        public UserProfileResponse getUserProfile(Long userId) {
                User user = userRepository.findByUserIdAndIsActiveTrue(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                UserProfileResponse.UserProfileData profileData = UserProfileResponse.UserProfileData.builder()
                                .userId(user.getUserId())
                                .username(user.getUserDetail().getUsername())
                                .nickname(user.getUserDetail().getNickname())
                                .email(user.getUserDetail().getEmail())
                                .role(user.getRole())
                                .jobId(user.getJob() != null ? user.getJob().getJobId() : null)
                                .jobName(user.getJob() != null ? user.getJob().getName() : null)
                                .bio(user.getUserDetail().getBio())
                                .profileImageUrl(user.getUserDetail().getProfileImageUrl())
                                .isActive(user.getIsActive())
                                .createdAt(user.getCreatedAt())
                                .updatedAt(user.getUpdatedAt())
                                .build();

                return UserProfileResponse.builder()
                                .success(true)
                                .data(profileData)
                                .build();
        }

        @Transactional(readOnly = true)
        public PublicProfileResponse getPublicProfile(String nickname, Long viewerId) {
                User user = userRepository.findByUserDetailNickname(nickname)
                                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND,
                                                "해당 닉네임의 사용자를 찾을 수 없습니다."));

                boolean isSubscribed = false;
                SubscriptionStatus status = statusRepository.findByName("ACTIVE")
                                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND,
                                                "ACTIVE 상태를 찾을 수 없습니다."));

                if (viewerId != null && user.getRole() == User.UserRole.CREATOR) {
                        isSubscribed = subscriptionRepository
                                        .existsByCreatorIdAndSubscriberIdAndStatus(user.getUserId(), viewerId, status);
                }

                log.info("viewerId: {}", viewerId);
                log.info("isSubscribed: {}", isSubscribed);

                long subsCount = subscriptionRepository.countByCreatorIdAndStatusName(user.getUserId(),
                                SubscriptionStatusName.ACTIVE);
                log.info("subsCount: {}", subsCount);

                return PublicProfileResponse.builder()
                                .userId(user.getUserId())
                                .nickname(nickname)
                                .role(user.getRole())
                                .jobName(user.getJob() != null ? user.getJob().getName() : null)
                                .bio(user.getUserDetail().getBio())
                                .profileImageUrl(user.getUserDetail().getProfileImageUrl())
                                .isActive(user.getIsActive())
                                .isSubscribed(isSubscribed)
                                .subsCount(subsCount)
                                .build();
        }

        @Transactional(readOnly = true)
        public SubscriptionCountResponseDto getCreatorInfo(Long userId) {
                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND,
                                                "해당 사용자를 찾을 수 없습니다."));

                long subsCount = subscriptionRepository.countByCreatorIdAndStatusName(user.getUserId(),
                                SubscriptionStatusName.ACTIVE);
                log.info("subsCount: {}", subsCount);

                LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
                long newSubsCount = subscriptionRepository.countNewActiveSubscriptionsThisMonth(startOfMonth);

                return SubscriptionCountResponseDto.builder()
                                .userId(user.getUserId())
                                .subsCount(subsCount)
                                .newSubsCount(newSubsCount)
                                .build();
        }

        @Transactional
        public void updateUserProfile(Long userId, UpdateProfileRequest request) {
                log.info("프로필 업데이트 시작 - userId: {}", userId);

                User user = userRepository.findByUserIdAndIsActiveTrue(userId)
                                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

                UserDetail userDetail = user.getUserDetail();

                // 카카오 사용자인지 확인
                boolean isKakaoUser = userDetail.getPlatform() == UserDetail.Platform.KAKAO;
                log.info("사용자 플랫폼 확인 - userId: {}, platform: {}, isKakaoUser: {}",
                                userId, userDetail.getPlatform(), isKakaoUser);

                // 요청 데이터 로깅
                log.info("요청 데이터 - nickname: {}, jobId: {}, bio: {}, profileImageUrl: {}, currentPassword: {}, newPassword: {}",
                                request.getNickname(), request.getJobId(), request.getBio(),
                                request.getProfileImageUrl(),
                                request.getCurrentPassword() != null ? "***" : null,
                                request.getNewPassword() != null ? "***" : null);

                // LOCAL 사용자만 비밀번호 검증
                if (!isKakaoUser) {
                        log.info("LOCAL 사용자 비밀번호 검증 시작");
                        String currentPassword = request.getCurrentPassword();
                        if (currentPassword == null || currentPassword.isEmpty()) {
                                log.error("LOCAL 사용자인데 현재 비밀번호가 없음");
                                throw new IllegalArgumentException("프로필을 수정하려면 현재 비밀번호를 입력해야 합니다.");
                        }
                        if (!passwordEncoder.matches(currentPassword, userDetail.getPassword())) {
                                log.error("현재 비밀번호 불일치");
                                throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
                        }
                        log.info("LOCAL 사용자 비밀번호 검증 완료");
                } else {
                        log.info("KAKAO 사용자 - 비밀번호 검증 건너뜀");
                }

                // 프로필 정보 업데이트
                if (request.getNickname() != null && !request.getNickname().isEmpty()) {
                        log.info("닉네임 업데이트: {} -> {}", userDetail.getNickname(), request.getNickname());
                        userDetail.setNickname(request.getNickname());
                }
                if (request.getBio() != null) {
                        log.info("소개글 업데이트");
                        userDetail.setBio(request.getBio());
                }
                if (user.getRole() == User.UserRole.CREATOR && request.getJobId() != null) {
                        log.info("직업 업데이트: jobId = {}", request.getJobId());
                        Job job = jobRepository.findById(request.getJobId())
                                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 직업입니다."));
                        user.setJob(job);
                }
                if (request.getProfileImageUrl() != null) {
                        log.info("프로필 이미지 업데이트");
                        userDetail.setProfileImageUrl(request.getProfileImageUrl());
                }

                // LOCAL 사용자만 비밀번호 변경 가능
                if (!isKakaoUser) {
                        String newPassword = request.getNewPassword();
                        if (newPassword != null && !newPassword.isEmpty()) {
                                log.info("비밀번호 변경 수행");
                                userDetail.setPassword(passwordEncoder.encode(newPassword));
                        }
                }

                userRepository.save(user);
                log.info("프로필 업데이트 완료 - userId: {}", userId);
        }

        @Transactional
        public void softDeleteUser(Long userId) {
                // 1. 익명화할 정보 생성
                String anonymizedNickname = "탈퇴한 사용자_" + userId;
                String anonymizedUsername = "탈퇴한 사용자";
                String anonymizedEmail = "deleted_" + userId + "@example.com";

                // 2. UserDetail 정보 익명화 (직접 업데이트)
                userDetailRepository.anonymizeUserDetails(userId, anonymizedNickname, anonymizedUsername,
                                anonymizedEmail);

                // 3. User 상태 비활성화 (직접 업데이트)
                userRepository.deactivateUser(userId);
        }
}