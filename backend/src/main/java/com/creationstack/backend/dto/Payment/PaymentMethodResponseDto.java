package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

// 카드 정보 응답 dto
@Getter
@Setter
@AllArgsConstructor
public class PaymentMethodResponseDto {
  private Long paymentMethodId;
  private String cardBrand;
  private String cardType;
  private String cardNumber;
  private String cardName;
}
