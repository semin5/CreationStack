package com.creationstack.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.creationstack.backend.domain.subscription.SubscriptionStatus;

public interface SubscriptionStatusRepository extends JpaRepository<SubscriptionStatus, Integer> {
    Optional<SubscriptionStatus> findByName(String name);
}
