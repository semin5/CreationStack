package com.creationstack.backend.dto.Subscription;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@RequiredArgsConstructor
@AllArgsConstructor
public class ActivateSubscriptionRequestDto {
  private Long paymentId;

}
