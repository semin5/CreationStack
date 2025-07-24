package com.creationstack.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.creationstack.backend.domain.payment.Payment;
import com.creationstack.backend.domain.payment.PaymentMethod;
import com.creationstack.backend.domain.payment.PaymentStatus;
import com.creationstack.backend.domain.subscription.Subscription;
import com.creationstack.backend.domain.subscription.SubscriptionStatus;
import com.creationstack.backend.domain.subscription.SubscriptionStatusName;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.Subscription.SubscriptionRequestDto;
import com.creationstack.backend.dto.Subscription.SubscriptionResponseDto;
import com.creationstack.backend.dto.Subscription.UserSubscriptionDto;
import com.creationstack.backend.dto.member.PublicProfileResponse;
import com.creationstack.backend.etc.Role;
import com.creationstack.backend.exception.CustomException;
import com.creationstack.backend.repository.PaymentMethodRepository;
import com.creationstack.backend.repository.PaymentRepository;
import com.creationstack.backend.repository.SubscriptionRepository;
import com.creationstack.backend.repository.SubscriptionStatusRepository;
import com.creationstack.backend.repository.UserRepository;

import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

        private final SubscriptionRepository subscriptionRepository;
        private final SubscriptionStatusRepository statusRepository;
        private final PaymentMethodRepository paymentMethodRepository;
        private final PaymentRepository paymentRepository;
        private final UserRepository userRepository;

        // 구독 생성 (PENDING 상태)
        @Transactional
        public SubscriptionResponseDto createPendingSubscription(Long subscriberId, SubscriptionRequestDto request) {
                log.info("구독 생성 시작");
                // 1. 구독 상태 PENDING 로딩
                SubscriptionStatus pendingStatus = statusRepository.findByName("PENDING")
                                .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR,
                                                "PENDING 상태를 찾을 수 없습니다"));

                // 2. 결제 수단 존재 확인
                log.info("요청 userId: {}", subscriberId);
                log.info("결제 수단 ID: {}", request.getPaymentMethodId());
                PaymentMethod paymentMethod = paymentMethodRepository.findById(request.getPaymentMethodId())
                                .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "결제 수단 정보가 없습니다."));

                LocalDateTime now = LocalDateTime.now();

                // 3. 자기 자신에게 구독 불가
                if (subscriberId.equals(request.getCreatorId())) {
                        throw new CustomException(HttpStatus.BAD_REQUEST, "자기 자신을 구독할 수 없습니다.");
                }

                // 4. 대상 크리에이터가 크리에이터인지 확인
                User creator = userRepository.findById(request.getCreatorId())
                                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "대상 사용자가 존재하지 않습니다."));

                if (!"CREATOR".equals(creator.getRole().name())) {
                        throw new CustomException(HttpStatus.BAD_REQUEST, "해당 사용자는 크리에이터가 아닙니다.");
                }

                // 5. 기존 구독 확인 및 처리
                Subscription existing = subscriptionRepository
                                .findBySubscriberIdAndCreatorId(subscriberId, request.getCreatorId())
                                .orElse(null);

                Subscription subscription;
                if (existing != null) {
                        if (SubscriptionStatusName.ACTIVE.equals(existing.getStatus().getName())) {
                                throw new CustomException(HttpStatus.CONFLICT, "이미 활성화된 구독이 있습니다.");
                        }
                        // 기존 구독이 있으나 ACTIVE는 아님 → 상태 유지 (변경 없음), 이후 결제 성공 시 상태 갱신
                        subscription = existing;
                } else {
                        subscription = new Subscription();
                        subscription.setSubscriberId(subscriberId);
                        subscription.setAmount(4900);
                        subscription.setCreatorId(request.getCreatorId());
                        subscription.setStatus(pendingStatus);
                        subscription.setStartedAt(now);
                        subscription.setLastPaymentAt(now);
                        subscription.setNextPaymentAt(now.plusMonths(1));
                        subscription.setPaymentMethod(paymentMethod);
                        subscriptionRepository.save(subscription);
                }

                return SubscriptionResponseDto.builder()
                                .subscriptionId(subscription.getSubscriptionId())
                                .creatorId(subscription.getCreatorId())
                                .statusName(subscription.getStatus().getName())
                                .startedAt(subscription.getStartedAt())
                                .nextPaymentAt(subscription.getNextPaymentAt())
                                .lastPaymentAt(subscription.getLastPaymentAt())
                                .message("구독 요청이 접수되었습니다 (PENDING)")
                                .build();
        }

        // 결제 성공 후 구독 활성화
        @Transactional
        public void activateSubscription(Long subscriptionId, Long paymentId) {
                Subscription subscription = subscriptionRepository.findById(subscriptionId)
                                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "구독 정보를 찾을 수 없습니다."));

                SubscriptionStatus activeStatus = statusRepository.findByName("ACTIVE")
                                .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR,
                                                "ACTIVE 상태 정보가 없습니다."));

                Payment payment = paymentRepository.getReferenceById(paymentId);
                if (payment.getPaymentStatus() != PaymentStatus.SUCCESS) {
                        throw new CustomException(HttpStatus.BAD_REQUEST, "결제가 실패하였습니다.");
                }

                subscription.setStatus(activeStatus);
                subscription.setLastPaymentAt(payment.getSuccessAt());
                subscription.setPaymentMethod(payment.getPaymentMethod());

                // 기존 nextPaymentAt이 없을 수도 있으니 null check
                subscription.setNextPaymentAt(
                                subscription.getNextPaymentAt() == null ? subscription.getStartedAt().plusMonths(1)
                                                : subscription.getNextPaymentAt());

                subscriptionRepository.save(subscription);
        }

        // 결제 실패 처리: 이전 구독이면 EXPIRED, 신규면 삭제
        @Transactional
        public void handleSubscriptionFailure(Long subscriptionId) {
                Subscription subscription = subscriptionRepository.findById(subscriptionId)
                                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "해당 구독을 찾을 수 없습니다."));

                String statusName = subscription.getStatus().getName();

                if (SubscriptionStatusName.PENDING.equals(statusName)) {
                        // 결제 전 신규 구독 실패 → 삭제
                        subscriptionRepository.delete(subscription);
                        return;
                }

                // 기존 구독이었던 경우 → EXPIRED 처리
                SubscriptionStatus expiredStatus = statusRepository.findByName(SubscriptionStatusName.EXPIRED)
                                .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR,
                                                "EXPIRED 상태를 찾을 수 없습니다."));

                subscription.setStatus(expiredStatus);
                subscriptionRepository.save(subscription);
        }

        // 구독 여부 조회
        @Transactional(readOnly = true)
        public boolean isActiveSubscriber(Long creatorId, Long SubscriberId) {
                SubscriptionStatus activeStatus = statusRepository.findByName("ACTIVE")
                                .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR,
                                                "ACTIVE 상태 정보가 없습니다."));

                return subscriptionRepository.existsByCreatorIdAndSubscriberIdAndStatus(
                                creatorId, SubscriberId, activeStatus);
        }

        // 사용자의 구독 목록 조회
        @Transactional
        public List<UserSubscriptionDto> getMySubscriptions(Long userId) {
                List<UserSubscriptionDto> list = subscriptionRepository.findAllBySubscriberId(userId);

                if (list.isEmpty()) {
                        return list;
                }

                List<Long> creatorIds = list.stream().map(UserSubscriptionDto::getCreatorId).distinct().toList();
                List<Object[]> counts = subscriptionRepository.countActiveSubscriptionsByCreatorIds(creatorIds);
                Map<Long, Long> subsCountMap = counts.stream()
                                .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));

                list.forEach(dto -> {
                        dto.setSubsCount(subsCountMap.getOrDefault(dto.getCreatorId(), 0L));
                        dto.setMessage(switch (dto.getStatusName()) {
                                case "ACTIVE" -> "다음 결제 예정일: " + format(dto.getNextPaymentAt());
                                case "CANCELLED" -> "만료 예정일: " + format(dto.getNextPaymentAt());
                                case "EXPIRED" -> "만료된 구독입니다.";
                                case "PENDING" -> "결제 대기 중입니다.";
                                default -> "";
                        });
                });

                return list;
        }

        private String format(LocalDateTime dt) {
                return dt != null ? dt.toLocalDate().toString() : "";
        }

        // 사용자가 구독한 크리에이터 목록 조회
        @Transactional(readOnly = true)
        public List<PublicProfileResponse> getSubscribedCreators(String nickname) {
                List<PublicProfileResponse> list = subscriptionRepository.findSubscribedCreatorsByNickname(nickname);

                if (list.isEmpty()) {
                        return list;
                }

                List<Long> creatorIds = list.stream().map(PublicProfileResponse::getUserId).distinct().toList();
                List<Object[]> counts = subscriptionRepository.countActiveSubscriptionsByCreatorIds(creatorIds);
                Map<Long, Long> subsCountMap = counts.stream()
                                .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));

                list.forEach(dto -> dto.setSubsCount(subsCountMap.getOrDefault(dto.getUserId(), 0L)));

                return list;
        }

        @Transactional
        public void cancelSubscription(Long subscriptionId, Long userId) {
                Subscription subscription = subscriptionRepository.findById(subscriptionId)
                                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "구독 정보를 찾을 수 없습니다."));

                if (!subscription.getSubscriberId().equals(userId)) {
                        throw new CustomException(HttpStatus.FORBIDDEN, "해당 구독을 해지할 권한이 없습니다.");
                }

                SubscriptionStatus cancelledStatus = statusRepository.findByName("CANCELLED")
                                .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR,
                                                "CANCELLED 상태 정보를 찾을 수 없습니다."));

                subscription.setStatus(cancelledStatus);

                // 크리에이터의 구독자 수 감소
                User creator = userRepository.findById(subscription.getCreatorId())
                        .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "크리에이터를 찾을 수 없습니다."));
                creator.setSubscriberCount(Math.max(0, creator.getSubscriberCount() - 1));
                userRepository.save(creator);
        }

}
