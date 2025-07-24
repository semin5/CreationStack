package com.creationstack.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.creationstack.backend.domain.subscription.SubscriptionStatus;
import com.creationstack.backend.repository.SubscriptionStatusRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class SubscriptionStatusDataLoader implements CommandLineRunner {
    private final SubscriptionStatusRepository subscriptionStatusRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("구독 상태 데이터 초기화를 시작합니다...");

        int addedCount = 0;

        addStatusIfMissing(1, "PENDING", "결제 대기 상태");
        addStatusIfMissing(2, "ACTIVE", "구독 활성 상태");
        addStatusIfMissing(3, "CANCELLED", "사용자에 의한 취소");
        addStatusIfMissing(4, "EXPIRED", "유효기간 만료");

        if (addedCount > 0) {
            log.info("구독 상태 초기화가 완료되었습니다. {}개의 새로운 상태가 추가되었습니다.", addedCount);
        } else {
            log.info("모든 구독 상태 데이터가 이미 존재합니다. 추가된 상태가 없습니다.");
        }

        log.info("현재 총 {}개의 구독 상태가 등록되어 있습니다.", subscriptionStatusRepository.count());

        // 내부 함수에서 사용하는 카운터는 로컬 변수라 final로 바꿔야 log에 정확히 반영됩니다.
    }

    private void addStatusIfMissing(int id, String name, String description) {
        if (!subscriptionStatusRepository.existsById(id)) {
            SubscriptionStatus status = new SubscriptionStatus();
            status.setStatusId(id);
            status.setName(name);
            status.setDescription(description);
            subscriptionStatusRepository.save(status);
            log.debug("구독 상태 추가됨: {} ({})", name, id);
        }
    }
}
