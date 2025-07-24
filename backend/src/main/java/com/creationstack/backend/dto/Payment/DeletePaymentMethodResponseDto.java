package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 결제수단 삭제 응답 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DeletePaymentMethodResponseDto {
  private Long paymentMethodId;
  private String deletedAt;
  private String message;
}
