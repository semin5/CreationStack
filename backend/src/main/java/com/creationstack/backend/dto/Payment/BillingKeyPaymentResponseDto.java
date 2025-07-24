package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 결제 완료, 결제내역 저장, 결제예약 완료 후 구독서비스에게 보내는 response dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BillingKeyPaymentResponseDto {
  private Long subscriptionId;
  private Long paymentId;
}
