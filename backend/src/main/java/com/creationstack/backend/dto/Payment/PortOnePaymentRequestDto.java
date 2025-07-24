package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 포트원 결제 요청 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PortOnePaymentRequestDto {
  private String storeId;
  private String billingKey; //빌링키(카드)
  private String orderName; //크리에이터닉네임 멤버십 정기 구독권
  private CustomerDto customer; //구매 사용자 정보(아이디, 이름, 이메일)
  private AmountDto amount; //가격
  private String currency;
  private String productType;
}

