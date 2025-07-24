package com.creationstack.backend.service;

import com.creationstack.backend.domain.payment.Payment;
import com.creationstack.backend.domain.payment.PaymentStatus;
import com.creationstack.backend.domain.subscription.Subscription;
import com.creationstack.backend.domain.subscription.SubscriptionStatus;
import com.creationstack.backend.domain.subscription.SubscriptionStatusName;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.exception.CustomException;
import com.creationstack.backend.repository.PaymentRepository;
import com.creationstack.backend.repository.SubscriptionRepository;
import com.creationstack.backend.repository.SubscriptionStatusRepository;
import com.creationstack.backend.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/*
* 1. 정기결제
* 2. 구독 취소에 따른 구독, 결제 내역 상태 변경
* */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionBillingService {

  private final SubscriptionRepository subscriptionRepository;
  private final SubscriptionStatusRepository subscriptionStatusRepository;
  private final PaymentService paymentService;
  private final UserRepository userRepository;

  // 정기결제 서비스
  @Transactional
  public void handleDueSubscriptions(){
    // 현재 날짜가 갱신일인 구독권 조회
    List<Subscription> subscriptions = subscriptionRepository.findAllByNextPaymentAtBefore(LocalDateTime.now());

    for(Subscription subscription : subscriptions){
      // 가입된 사용자인지 확인 후 없으면 정기결제 실패
      User user = userRepository.findById(subscription.getSubscriberId()).orElseThrow(
          () -> new CustomException(HttpStatus.NOT_FOUND, "정기결제 실패"));

      // 구독 상태 조회
      String status = subscription.getStatus().getName();
      if(SubscriptionStatusName.ACTIVE.equals(status)){// 활성화된 구독인 경우
        // 결제 진행 + 결제내역 생성
        paymentService.processAutoBilling(subscription, user);

        // 구독 마지막날짜 + 다음 구독 갱신일 업데이트
        subscription.setLastPaymentAt(LocalDateTime.now());
        subscription.setNextPaymentAt(LocalDateTime.now().plusMonths(1));
      }else if(SubscriptionStatusName.CANCELLED.equals(status)){ // 해지는 했으나 아직 만료가 되지 않은 경우
        SubscriptionStatus expired = subscriptionStatusRepository.findByName(SubscriptionStatusName.EXPIRED).orElseThrow(()-> new CustomException(
            HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류"));
        // 구독 상태 변경
        subscription.setStatus(expired);
        log.info("Subscription status expired: {}", expired);
      }else{ // 만료 또는 pending 상태의 구독권
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        subscriptionRepository.deleteOldExpiredSubscriptions(threshold);
        log.info("만료된지 일주일 지난 구독 내역 삭제");
      }
    }
  }
}
