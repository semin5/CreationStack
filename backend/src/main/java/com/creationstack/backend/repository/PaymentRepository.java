package com.creationstack.backend.repository;

import com.creationstack.backend.domain.payment.Payment;
import com.creationstack.backend.domain.payment.PaymentMethod;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  List<Payment> findByPaymentMethod(PaymentMethod paymentMethod);
}
