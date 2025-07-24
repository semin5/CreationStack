package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//포트원 결제예약요청 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PortOneReservationRequestDto {
  private PortOnePaymentRequestDto payment;
  private String timeToPay;
}
