package com.creationstack.backend.domain.payment;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "payment_method")
public class PaymentMethod {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long paymentMethodId;

  private Long userId;
  //  private User user;

  @Column(length = 255, name = "billing_key")
  private String billingKey;

  @Column(nullable = false, length = 100)
  private String cardName;

  @Column(nullable = false, length = 50)
  private String cardNumber;

  @Column(length = 50)
  private String cardType;

  @Column(length = 50)
  private String cardBrand;

  @CreationTimestamp
  private LocalDateTime createdAt;
}
