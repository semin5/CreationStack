package com.creationstack.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.creationstack.backend.dto.Subscription.ActivateSubscriptionRequestDto;
import com.creationstack.backend.dto.Subscription.SubscriptionRequestDto;
import com.creationstack.backend.dto.Subscription.SubscriptionResponseDto;
import com.creationstack.backend.dto.Subscription.UserSubscriptionDto;
import com.creationstack.backend.dto.member.PublicProfileResponse;
import com.creationstack.backend.service.SubscriptionService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    // 구독 생성 요청
    @PostMapping("/subscriptions/pending")
    public ResponseEntity<SubscriptionResponseDto> createPending(
            Authentication authentication,
            // @RequestBody User user,
            @RequestBody SubscriptionRequestDto request) {
        Long subscriberId = (Long) authentication.getPrincipal();

        // Long subscriberId = user.getUserId();
        // 구독 생성 요청subscriberId
        // Long subscriberId = 2L;
        SubscriptionResponseDto response = subscriptionService.createPendingSubscription(subscriberId, request);
        return ResponseEntity.ok(response);
    }

    // 결제 성공 시 구독 상태 ACTIVE로 변경
    @PostMapping("/subscriptions/{subscriptionId}/activate")
    public ResponseEntity<String> activateSubscription(
            @PathVariable Long subscriptionId,
            @RequestBody ActivateSubscriptionRequestDto dto) {
        subscriptionService.activateSubscription(subscriptionId, dto.getPaymentId());
        return ResponseEntity.ok("구독이 활성화되었습니다.");
    }

    // 결제 실패 시 처리
    @PostMapping("/subscriptions/{subscriptionId}/fail")
    public ResponseEntity<String> failSubscription(@PathVariable Long subscriptionId) {
        subscriptionService.handleSubscriptionFailure(subscriptionId);
        return ResponseEntity.ok("구독 실패 처리가 완료되었습니다.");
    }

    // 사용자 구독 목록 조회
    @GetMapping("/users/me/subscriptions")
    public ResponseEntity<Map<String, Object>> getMySubscriptions(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        List<UserSubscriptionDto> subscriptions = subscriptionService.getMySubscriptions(userId);
        return ResponseEntity.ok(Map.of("subscriptions", subscriptions));
    }

    // 사용자가 구독한 크리에이터 목록 조회
    @GetMapping("/users/{nickname}/subscriptions")
    public ResponseEntity<Map<String, Object>> getSubscribedCreators(@PathVariable String nickname) {
        List<PublicProfileResponse> subscriptions = subscriptionService.getSubscribedCreators(nickname);
        return ResponseEntity.ok(Map.of("subscriptions", subscriptions));
    }

    // 구독 해지 (CANCELLED로 변경)
    @PatchMapping("/subscriptions/{subscriptionId}")
    public ResponseEntity<?> cancelSubscription(@PathVariable Long subscriptionId, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        subscriptionService.cancelSubscription(subscriptionId, userId);

        return ResponseEntity.ok(Map.of(
            "subscriptionId", subscriptionId,
            "status", "CANCELLED",
            "message", "구독이 정상적으로 해지되었습니다."
        ));
    }


}
