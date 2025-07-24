package com.creationstack.backend.controller;

import com.creationstack.backend.dto.Payment.BillingKeyPaymentRequestDto;
import com.creationstack.backend.dto.Payment.BillingKeyPaymentResponseDto;
import com.creationstack.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

  private final PaymentService paymentService;

  @PostMapping("/api/billings/payments")
  public ResponseEntity<BillingKeyPaymentResponseDto> processBillingKeyPay(
      @RequestBody BillingKeyPaymentRequestDto req) {
    BillingKeyPaymentResponseDto res = paymentService.processingBillingKeyPay(req);
    return ResponseEntity.ok(res);
  }
}
