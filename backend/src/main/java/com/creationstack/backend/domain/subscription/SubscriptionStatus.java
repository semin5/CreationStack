package com.creationstack.backend.domain.subscription;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
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
@Table(name = "subscription_status")
public class SubscriptionStatus {
    
    @Id
    private Integer statusId;

    @Column(nullable = false, unique = true, length=20)
    private String name;    // 'PENDING', 'ACTIVE', ...

    @Column(length=100)
    private String description;
}
