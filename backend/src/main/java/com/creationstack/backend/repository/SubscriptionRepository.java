package com.creationstack.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.creationstack.backend.domain.payment.PaymentMethod;
import com.creationstack.backend.domain.subscription.Subscription;
import com.creationstack.backend.domain.subscription.SubscriptionStatus;
import com.creationstack.backend.dto.Subscription.UserSubscriptionDto;
import com.creationstack.backend.dto.member.PublicProfileResponse;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findBySubscriberIdAndCreatorId(Long subscriberId, Long creatorId);

    List<Subscription> findByPaymentMethod(PaymentMethod paymentMethod);

    List<Subscription> findAllByNextPaymentAtBefore(LocalDateTime time);

    boolean existsByCreatorIdAndSubscriberIdAndStatus(Long creatorId, Long subscriberId, SubscriptionStatus status);

    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.creatorId = :creatorId AND s.status.name = :statusName")
    long countByCreatorIdAndStatusName(@Param("creatorId") Long creatorId, @Param("statusName") String statusName);

    @Query("""
                SELECT COUNT(s)
                FROM Subscription s
                JOIN s.status st
                WHERE st.name = 'ACTIVE'
                  AND s.startedAt >= :startOfMonth
            """)
    long countNewActiveSubscriptionsThisMonth(@Param("startOfMonth") LocalDateTime startOfMonth);

    @Modifying
    @Query("DELETE FROM Subscription s WHERE s.status.name IN ('EXPIRED') AND s.nextPaymentAt <= :threshold")
    void deleteOldExpiredSubscriptions(@Param("threshold") LocalDateTime threshold);

    @Query("""
            SELECT new com.creationstack.backend.dto.Subscription.UserSubscriptionDto(
                s.subscriptionId,
                s.creatorId,
                ud.nickname,
                ud.profileImageUrl,
                ud.bio,
                0L, 
                ss.name,
                s.startedAt,
                s.nextPaymentAt,
                s.lastPaymentAt,
                NULL
            )
                FROM Subscription s
                JOIN UserDetail ud ON s.creatorId = ud.userId
                JOIN SubscriptionStatus ss ON s.status.statusId = ss.statusId
                WHERE s.subscriberId = :subscriberId
            """)
    List<UserSubscriptionDto> findAllBySubscriberId(@Param("subscriberId") Long subscriberId);

    @Query("""
                SELECT new com.creationstack.backend.dto.member.PublicProfileResponse(
                    u.userId, ud.nickname, u.role, j.name,
                    ud.bio, ud.profileImageUrl, u.isActive,
                    0L
                )
                FROM Subscription s
                JOIN s.status st
                JOIN User u ON s.creatorId = u.userId
                JOIN UserDetail ud ON u.userId = ud.userId
                LEFT JOIN Job j ON u.job.jobId = j.jobId
                WHERE s.subscriberId = (
                    SELECT ud2.userId FROM UserDetail ud2 WHERE ud2.nickname = :nickname
                )
                AND u.isActive = true
                AND st.name = 'ACTIVE'
            """)
    List<PublicProfileResponse> findSubscribedCreatorsByNickname(@Param("nickname") String nickname);

    @Query("""
        SELECT s.creatorId, COUNT(s)
        FROM Subscription s
        WHERE s.creatorId IN :creatorIds AND s.status.name = 'ACTIVE'
        GROUP BY s.creatorId
    """)
    List<Object[]> countActiveSubscriptionsByCreatorIds(@Param("creatorIds") List<Long> creatorIds);

}
