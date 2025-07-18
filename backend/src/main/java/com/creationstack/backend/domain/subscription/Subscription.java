package com.creationstack.backend.domain.subscription;

import java.time.LocalDateTime;

import com.creationstack.backend.domain.payment.PaymentMethod;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name="subscription")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subscriptionId;   // 구독 ID

    @Column(nullable = false)
    private Long subscriberId;  // 구독 요청한 사용자 ID
    
    @Column(nullable = false)
    private Long creatorId; // 구독할 대상 크리에이터 ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "status_id", nullable = false)
    private SubscriptionStatus status;  // ACTIVE, CANCELLED, EXPIRED

    @ManyToOne
    @JoinColumn(name = "payment_method_id", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(nullable = false)
    private LocalDateTime startedAt;    // 구독 시작일  
    
    @Column(nullable = false)
    private LocalDateTime nextPaymentAt;    // 다음 결제 시각
    
    @Column(nullable = false)
    private LocalDateTime lastPaymentAt;    // 마지막 결제 시각

    @Column(length = 255)
    private String scheduleId;  // 매달 정기결제용 (포트원에서 넘어오는 값)
    
}
