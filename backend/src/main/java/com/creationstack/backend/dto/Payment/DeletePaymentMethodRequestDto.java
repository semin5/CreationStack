package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 결제수단 삭제 요청 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DeletePaymentMethodRequestDto {
  private Long paymentMethodId;
  private String reason;
}
