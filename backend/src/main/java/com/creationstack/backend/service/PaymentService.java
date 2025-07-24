package com.creationstack.backend.service;

import com.creationstack.backend.config.PortOneClient;

import com.creationstack.backend.domain.payment.Payment;
import com.creationstack.backend.domain.payment.PaymentMethod;

import com.creationstack.backend.domain.payment.PaymentStatus;
import com.creationstack.backend.domain.subscription.Subscription;
import com.creationstack.backend.domain.subscription.SubscriptionStatus;
import com.creationstack.backend.domain.subscription.SubscriptionStatusName;
import com.creationstack.backend.domain.user.User;
import com.creationstack.backend.dto.Payment.AmountDto;
import com.creationstack.backend.dto.Payment.BillingKeyPaymentRequestDto;
import com.creationstack.backend.dto.Payment.BillingKeyPaymentResponseDto;
import com.creationstack.backend.dto.Payment.CustomerDto;
import com.creationstack.backend.dto.Payment.CustomerDto.Name;
import com.creationstack.backend.dto.Payment.PortOneBillingResponseDto;
import com.creationstack.backend.dto.Payment.PortOnePaymentRequestDto;

import com.creationstack.backend.exception.CustomException;
import com.creationstack.backend.repository.PaymentRepository;
import com.creationstack.backend.repository.SubscriptionRepository;
import com.creationstack.backend.repository.SubscriptionStatusRepository;
import com.creationstack.backend.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

  private final PaymentRepository paymentRepository;
  private final PaymentMethodService paymentMethodService;
  private final PortOneClient portOneClient;
  private final UserRepository userRepository;
  private final SubscriptionRepository subscriptionRepository;
  private final SubscriptionStatusRepository subscriptionStatusRepository;

  // 구독 요청 시 결제 진행 (최초 결제)
  @Transactional
  public BillingKeyPaymentResponseDto processingBillingKeyPay(BillingKeyPaymentRequestDto req) {
    // 결제수단과 연결된 빌링키
    PaymentMethod paymentMethod = paymentMethodService.getPaymentMethodForBillingKey(req.getPaymentMethodId());

    // 구매하는 사용자 정보 가져와 구매자 객체 생성
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    Long subscriberId = Long.parseLong(authentication.getName());
    User user = userRepository.findById(subscriberId).orElseThrow(
        () -> new CustomException(HttpStatus.NOT_FOUND,"가입되지 않은 사용자입니다.")
    );
    CustomerDto customer = new CustomerDto(subscriberId+"",user.getUserDetail().getEmail(),new Name(user.getUserDetail().getUsername()));

    Subscription subscription = subscriptionRepository.findById(req.getSubscriptionId()).orElseThrow(
        () -> new CustomException(HttpStatus.NOT_FOUND, "구독 정보를 찾을 수 없습니다.")
    );

    // 구독 상태가 PENDING, CANCELLED, EXPIRED 중 하나인지 확인
    String currentStatus = subscription.getStatus().getName();
    if (!(currentStatus.equals(SubscriptionStatusName.PENDING) ||
          currentStatus.equals(SubscriptionStatusName.CANCELLED) ||
          currentStatus.equals(SubscriptionStatusName.EXPIRED))) {
      throw new CustomException(HttpStatus.BAD_REQUEST, "유효하지 않은 구독 상태입니다: " + currentStatus);
    }

    // 결제 내역 생성
    Payment payment = Payment.builder()
        .paymentMethod(paymentMethod)
        .subscription(subscription)
        .amount(req.getAmount())
        .paymentStatus(PaymentStatus.PENDING)
        .tryAt(LocalDateTime.now())
        .build();

    //request Body 설정
    PortOnePaymentRequestDto requestBody = PortOnePaymentRequestDto.builder()
        .billingKey(paymentMethod.getBillingKey())
        .orderName(req.getOrderName())
        .customer(customer)
        .amount(new AmountDto(req.getAmount()))
        .currency("KRW")
        .productType("DIGITAL")
        .build();

    // 결제 요청
    PortOneBillingResponseDto response = portOneClient.processingBillingKeyPay(requestBody);

    String rawDateTime = response.getResponse().get("payment").get("paidAt").asText();
    Instant instant = Instant.parse(rawDateTime);
    LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.of("Asia/Seoul"));

    // 결제 성공 후 업데이트
    payment.setTransactionId(response.getResponse().get("payment").get("pgTxId").asText());
    payment.setSuccessAt(localDateTime);
    payment.setPaymentStatus(PaymentStatus.SUCCESS);

    // 구독 상태를 ACTIVE로 변경
    SubscriptionStatus activeStatus = subscriptionStatusRepository.findByName(SubscriptionStatusName.ACTIVE)
        .orElseThrow(() -> new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "ACTIVE 상태 정보를 찾을 수 없습니다."));
    subscription.setStatus(activeStatus);
    subscription.setLastPaymentAt(localDateTime);
    subscription.setNextPaymentAt(subscription.getStartedAt().plusMonths(1));

    // 크리에이터의 구독자 수 증가 (이전에 ACTIVE가 아니었던 경우에만)
    if (!currentStatus.equals(SubscriptionStatusName.ACTIVE)) {
      User creator = userRepository.findById(subscription.getCreatorId())
          .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND, "크리에이터를 찾을 수 없습니다."));
      creator.setSubscriberCount(creator.getSubscriberCount() + 1);
      userRepository.save(creator);
    }

    // 저장된 결제내역 및 구독 정보
    paymentRepository.save(payment);
    subscriptionRepository.save(subscription);

    BillingKeyPaymentResponseDto responseDto = new BillingKeyPaymentResponseDto(
        subscription.getSubscriptionId(), payment.getPaymentId());

    return responseDto;
  }

  //정기 결제 진행 + 결제 내역 생성
  @Transactional
  public void processAutoBilling(Subscription subscription, User user) {

    // 연결된 결제 수단 & 구매자 조회. 구매자 조회 안되면 정기결제 실패
    PaymentMethod paymentMethod = subscription.getPaymentMethod();

    // 결제 요청할 dto 생성
    PortOnePaymentRequestDto req = PortOnePaymentRequestDto.builder()
        .billingKey(paymentMethod.getBillingKey())
        .orderName(LocalDateTime.now().getMonthValue()+"월 정기 결제") // 추후 변경
        .customer(new CustomerDto(
            String.valueOf(subscription.getSubscriberId()),
            user.getUserDetail().getEmail(), // 이메일 필요 시 DB에서 받아오세요
            new Name(user.getUserDetail().getUsername())))
        .amount(new AmountDto(4900))
        .currency("KRW")
        .productType("DIGITAL")
        .build();

    // 결제 내역 생성
    Payment payment = Payment.builder()
        .paymentMethod(paymentMethod)
        .subscription(subscription)
        .amount(req.getAmount().getTotal())
        .paymentStatus(PaymentStatus.PENDING)
        .tryAt(LocalDateTime.now())
        .build();

    // 결제 요청
    PortOneBillingResponseDto response = portOneClient.processingBillingKeyPay(req);

    String rawDateTime = response.getResponse().get("payment").get("paidAt").asText();
    Instant instant = Instant.parse(rawDateTime);
    LocalDateTime localDateTime = LocalDateTime.ofInstant(instant, ZoneId.of("Asia/Seoul"));

    // 결제 성공 후 업데이트
    payment.setTransactionId(response.getResponse().get("payment").get("pgTxId").asText());
    payment.setSuccessAt(localDateTime);
    payment.setPaymentStatus(PaymentStatus.SUCCESS);

    paymentRepository.save(payment);
  }

}
