package com.creationstack.backend.controller;

import com.creationstack.backend.dto.Payment.DeletePaymentMethodRequestDto;
import com.creationstack.backend.dto.Payment.DeletePaymentMethodResponseDto;
import com.creationstack.backend.dto.Payment.PaymentMethodResponseDto;
import com.creationstack.backend.dto.Payment.SavePaymentMethodRequestDto;
import com.creationstack.backend.dto.Payment.SavePaymentMethodResponseDto;
import com.creationstack.backend.service.PaymentMethodService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Slf4j
public class PaymentMethodController {
  private final PaymentMethodService paymentMethodService;

  // 1. 카드 등록 후 결제 수단 반환
  @PostMapping("/api/billings/card")
  public ResponseEntity<SavePaymentMethodResponseDto> savePaymentMethod(Authentication authentication, @RequestBody SavePaymentMethodRequestDto req){
    Long userId = (Long) authentication.getPrincipal();
    return ResponseEntity.ok(paymentMethodService.save(userId,req));
  }

  // 2. 사용자의 모든 결제 수단 조회
  @GetMapping("/api/payments")
  public ResponseEntity<List<PaymentMethodResponseDto>> getAllPaymentMethods(Authentication authentication){
    Long userId = (Long) authentication.getPrincipal();
    return ResponseEntity.ok(paymentMethodService.getPaymentMethod(userId));
  }

  // 3. 결제 수단 삭제
  @PostMapping("/api/billings/keys")
  public ResponseEntity<DeletePaymentMethodResponseDto> deletePaymentMethod(Authentication authentication, @RequestBody DeletePaymentMethodRequestDto req){
    return ResponseEntity.ok(paymentMethodService.deletePaymentMethod(req));
  }
}
