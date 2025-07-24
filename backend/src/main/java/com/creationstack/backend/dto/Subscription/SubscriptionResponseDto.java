package com.creationstack.backend.dto.Subscription;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SubscriptionResponseDto {
    private Long subscriptionId;
    private Long creatorId;
    private String statusName;
    private LocalDateTime startedAt;
    private LocalDateTime nextPaymentAt;
    private LocalDateTime lastPaymentAt;
    private String message;
}
