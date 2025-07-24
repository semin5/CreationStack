package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 구독서비스에서 요청하는 결제 요청 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BillingKeyPaymentRequestDto {
  private int amount; //가격
  private Long subscriptionId;
  private Long paymentMethodId; //결제수단
  private String creatorId; //구독 상품 크리에이터
  private String orderName; //구독 상품 제목
}
