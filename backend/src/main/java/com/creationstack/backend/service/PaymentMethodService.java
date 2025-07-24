package com.creationstack.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.creationstack.backend.config.PortOneClient;
import com.creationstack.backend.domain.payment.Payment;
import com.creationstack.backend.domain.payment.PaymentMethod;
import com.creationstack.backend.domain.subscription.Subscription;
import com.creationstack.backend.domain.user.UserDetail;
import com.creationstack.backend.dto.Payment.DeletePaymentMethodRequestDto;
import com.creationstack.backend.dto.Payment.DeletePaymentMethodResponseDto;
import com.creationstack.backend.dto.Payment.PaymentMethodResponseDto;
import com.creationstack.backend.dto.Payment.SavePaymentMethodRequestDto;
import com.creationstack.backend.dto.Payment.SavePaymentMethodResponseDto;
import com.creationstack.backend.exception.CustomException;
import com.creationstack.backend.repository.PaymentMethodRepository;
import com.creationstack.backend.repository.PaymentRepository;
import com.creationstack.backend.repository.SubscriptionRepository;
import com.creationstack.backend.repository.UserDetailRepository;
import com.fasterxml.jackson.databind.JsonNode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentMethodService {

  private final PaymentMethodRepository paymentMethodRepository;
  private final PortOneClient portOneClient;
  private final SubscriptionRepository subscriptionRepository;
  private final PaymentRepository paymentRepository;
  private final UserDetailRepository userDetailRepository;

  // 1. 결제수단 저장
  @Transactional
  public SavePaymentMethodResponseDto save(Long userId, SavePaymentMethodRequestDto req) {
    try {
      String billingKey = req.getBillingKey();
      JsonNode card = portOneClient.getBillingKeyInfo(billingKey);

      if (card == null || card.get("name") == null || card.get("number") == null) {
        throw new IllegalStateException("카드 정보가 누락되었습니다.");
      }

      UserDetail userDetail = userDetailRepository.findById(userId)
          .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

      PaymentMethod paymentMethod = PaymentMethod.builder()
          .userId(userId)
          .billingKey(billingKey)
          .cardName(card.get("name").asText())
          .cardBrand(card.get("brand").asText())
          .cardNumber(card.get("number").asText())
          .cardType(card.get("type").asText())
          .build();


      paymentMethodRepository.save(paymentMethod);

      return new SavePaymentMethodResponseDto(
          userDetail.getUsername(),
          paymentMethod.getCardBrand(),
          paymentMethod.getCardType(),
          paymentMethod.getCardName(),
          paymentMethod.getCardNumber());
    } catch (Exception e) {
      log.error("결제수단 저장 실패", e); // 기존 예외 기록
      throw new RuntimeException("결제수단 저장 실패", e);
    }
  }

  // 2. 회원 ID 통해 저장된 결제수단 호출
  public List<PaymentMethodResponseDto> getPaymentMethod(Long userId) {
    return paymentMethodRepository.findAllByUserId(userId).stream()
        .map(paymentMethod -> new PaymentMethodResponseDto(
            paymentMethod.getPaymentMethodId(), // DB에 저장된 결제수단 고유ID
            paymentMethod.getCardBrand(), // MASTER | VISA
            paymentMethod.getCardType(), // CREDIT | DEBIT
            paymentMethod.getCardNumber(), // 0000-0000-****-**00
            paymentMethod.getCardName() // 신한은행, 국민은행
        )).toList();
  }

  // 3. 빌링키 이용해 결제수단 삭제(결제수단 단독 삭제)
  @Transactional
  public DeletePaymentMethodResponseDto deletePaymentMethod(DeletePaymentMethodRequestDto req) {
    Long paymentMethodId = req.getPaymentMethodId();

    // 1. 결제수단 조회
    PaymentMethod paymentMethod = paymentMethodRepository.findById(paymentMethodId)
        .orElseThrow(() -> new CustomException(HttpStatus.BAD_REQUEST, "조회되는 결제수단이 없습니다."));

    // 2. 연관된 Subscription, Payment에서 연결 해제
    detachPaymentMethodFromRelations(paymentMethod);

    // 3. 포트원 API 호출
    JsonNode responseBody = portOneClient.deleteBillingKey(req, paymentMethod.getBillingKey());

    // 4. deletedAt 필드 안전하게 파싱
    String deletedAt;
    if (responseBody.has("deletedAt") && !responseBody.get("deletedAt").isNull()) {
      deletedAt = responseBody.get("deletedAt").asText();
    } else if (responseBody.has("type") && "BILLING_KEY_ALREADY_DELETED".equals(responseBody.get("type").asText())) {
      deletedAt = "이미 삭제된 결제수단입니다.";
    } else {
      throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR,
          "PortOne 응답 파싱 오류: deletedAt 없음 / 예상치 못한 응답 - " + responseBody.toString());
    }


    // 5. DB에서 결제수단 삭제
    int deletedCount = paymentMethodRepository.deletePaymentMethodByPaymentMethodId(paymentMethodId);
    if (deletedCount == 0) {
      throw new CustomException(HttpStatus.BAD_REQUEST, "결제수단 삭제 실패");
    }

    log.info("[PaymentMethodService] deletePaymentMethod 삭제완료: {}", paymentMethodId);

    // 6. 응답 구성
    return DeletePaymentMethodResponseDto.builder()
        .paymentMethodId(paymentMethodId)
        .deletedAt(deletedAt)
        .message(req.getReason() == null ? "결제수단이 삭제되었습니다." : req.getReason())
        .build();
  }

  // 4. paymentMethodId 이용한 결제수단 조회
  public PaymentMethod getPaymentMethodForBillingKey(Long paymentMethodId) {
    return paymentMethodRepository.findById(paymentMethodId).orElse(null);
  }

  private void detachPaymentMethodFromRelations(PaymentMethod paymentMethod) {
    // Subscription에서 결제수단 제거
    List<Subscription> subscriptions = subscriptionRepository.findByPaymentMethod(paymentMethod);
    boolean hasActiveSubscription = subscriptions.stream()
        .anyMatch(subscription -> subscription.getStatus() != null &&
            "ACTIVE".equalsIgnoreCase(subscription.getStatus().getName()));

    // 활성화된 구독이 연결되어 있으면 결제할 수 없게 함
    if (hasActiveSubscription) {
      throw new CustomException(HttpStatus.BAD_REQUEST, "활성화된 구독이 있어 결제수단을 삭제할 수 없습니다.");
    }
    subscriptions.forEach(subscription -> subscription.setPaymentMethod(null));
    subscriptionRepository.saveAll(subscriptions);

    // Payment에서 결제수단 제거
    List<Payment> payments = paymentRepository.findByPaymentMethod(paymentMethod);
    payments.forEach(payment -> payment.setPaymentMethod(null));
    paymentRepository.saveAll(payments);

    log.info("[PaymentMethodService] 연관된 Subscription({})건, Payment({})건에서 결제수단 제거 완료",
        subscriptions.size(), payments.size());
  }
}
