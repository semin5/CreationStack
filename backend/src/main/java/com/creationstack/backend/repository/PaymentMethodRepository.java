package com.creationstack.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

import com.creationstack.backend.domain.payment.PaymentMethod;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Long> {
  List<PaymentMethod> findAllByUserId(Long userId);

  @Modifying
  @Query("DELETE FROM PaymentMethod p WHERE p.paymentMethodId = :id")
  int deletePaymentMethodByPaymentMethodId(@Param("id") Long paymentMethodId);
}
