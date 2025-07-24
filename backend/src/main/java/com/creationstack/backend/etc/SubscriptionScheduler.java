package com.creationstack.backend.etc;

import com.creationstack.backend.service.SubscriptionBillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

// 정기결제 스케줄러
@Component
@RequiredArgsConstructor
@EnableScheduling
@Slf4j
public class SubscriptionScheduler {
  private final SubscriptionBillingService subscriptionBillingService;

  // 매일 00:00에 실행
  @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
  public void run(){
    subscriptionBillingService.handleDueSubscriptions();
  }
}