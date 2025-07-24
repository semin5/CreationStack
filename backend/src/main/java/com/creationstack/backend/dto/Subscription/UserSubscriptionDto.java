package com.creationstack.backend.dto.Subscription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserSubscriptionDto {

    private Long subscriptionId;
    private Long creatorId;
    private String creatorNickname;
    private String creatorProfileUrl;
    private String bio;
    private Long subsCount;

    private String statusName;
    private LocalDateTime startedAt;
    private LocalDateTime nextPaymentAt;
    private LocalDateTime lastPaymentAt;
    private String message;

}
