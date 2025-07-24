package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 포트원 결제수단 요청 dto
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavePaymentMethodRequestDto {
  private String billingKey;
}
