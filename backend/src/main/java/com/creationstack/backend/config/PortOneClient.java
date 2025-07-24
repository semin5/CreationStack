package com.creationstack.backend.config;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import com.creationstack.backend.dto.Payment.DeletePaymentMethodRequestDto;
import com.creationstack.backend.dto.Payment.PortOneBillingResponseDto;
import com.creationstack.backend.dto.Payment.PortOnePaymentRequestDto;
import com.creationstack.backend.dto.Payment.PortOneReservationRequestDto;
import com.creationstack.backend.dto.Payment.PortOneReservationResponseDto;
import com.creationstack.backend.dto.Payment.PortOneReservationResponseDto.ScheduleDto;
import com.creationstack.backend.exception.CustomException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class PortOneClient {

  private final RestTemplate restTemplate = new RestTemplate();
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Value("${portone.apisecret}")
  private String API_SECRET;

  public PortOneClient(@Value("${portone.apisecret}") String API_SECRET) {
    this.API_SECRET = API_SECRET;
  }

  @Value("${portone.hostname}")
  private String API_HOSTNAME;

  @Value("${portone.storeid}")
  private String STORE_ID;

  // billingkey에 등록된 카드 정보 요청
public JsonNode getBillingKeyInfo(String billingKey) {
    String requestUrl = API_HOSTNAME + "/billing-keys/" + billingKey;
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "PortOne " + API_SECRET);
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity<Void> entity = new HttpEntity<>(headers);

    int retry = 0;
    int maxRetries = 3;
    long retryDelayMillis = 1000;

    while (retry < maxRetries) {
        try {

            ResponseEntity<String> response =
                restTemplate.exchange(requestUrl, HttpMethod.GET, entity, String.class);

            log.info("[PortOneClient] 응답 상태 코드: {}", response.getStatusCode());

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new CustomException(HttpStatus.resolve(response.getStatusCode().value()),
                    "PortOne API 호출 실패: " + response.getBody());
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode methods = root.get("methods");

            if (methods == null || !methods.isArray() || methods.size() == 0) {
                throw new IllegalStateException("methods 정보가 존재하지 않습니다.");
            }

            JsonNode card = methods.get(0).get("card");
            if (card == null || card.isNull()) {
                throw new IllegalStateException("card 정보가 응답에 존재하지 않습니다.");
            }

            return card;

        } catch (Exception e) {
            log.warn("[PortOneClient] 카드 정보 조회 실패 (시도 {}): {}", retry + 1, e.getMessage());
            retry++;

            if (retry < maxRetries) {
                try {
                    Thread.sleep(retryDelayMillis);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("스레드 중단됨", ie);
                }
            } else {
                throw new RuntimeException("카드 정보 조회 실패 - 최대 재시도 초과", e);
            }
        }
    }

    throw new IllegalStateException("도달할 수 없는 카드 조회 실패 로직");
}



  //카드 이용한 결제 진행
  public PortOneBillingResponseDto processingBillingKeyPay(PortOnePaymentRequestDto requestBody) {

    // 주문 ID 생성(portone 등록)
    String portOnePaymentId = "order-"+generateWithTimestamp();

    // 요청 url 설정
    String requestUrl = API_HOSTNAME + "/payments/" + portOnePaymentId + "/billing-key";

    // 헤더 설정
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "PortOne " + API_SECRET);
    headers.setContentType(MediaType.APPLICATION_JSON);
    requestBody.setStoreId(STORE_ID);

    HttpEntity<PortOnePaymentRequestDto> entity = new HttpEntity<>(requestBody, headers);

     // 요청 전송
    ResponseEntity<String> response =
        restTemplate.exchange(requestUrl, HttpMethod.POST, entity, String.class);

    try {
      return PortOneBillingResponseDto.builder().portOnePaymentId(portOnePaymentId)
          .response(objectMapper.readTree(response.getBody())).build();
    } catch (Exception e) {
      throw new CustomException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  // 결제 예약
  public PortOneReservationResponseDto reservationPayment(PortOneReservationRequestDto requestBody){
    String portOnePaymentId = "pay-"+generateWithTimestamp();
    String requestUrl = API_HOSTNAME + "/payments/" + portOnePaymentId + "/schedule";
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "PortOne " + API_SECRET);
    headers.setContentType(MediaType.APPLICATION_JSON);

    HttpEntity<PortOneReservationRequestDto> entity = new HttpEntity<>(requestBody, headers);

    ResponseEntity<String> response =
        restTemplate.exchange(requestUrl, HttpMethod.POST, entity, String.class);

    try {
      String scheduleId = objectMapper.readTree(response.getBody()).get("schedule").get("id").asText();
      return PortOneReservationResponseDto.builder().schedule(new ScheduleDto(scheduleId)).build();
    } catch (Exception e) {
      throw new CustomException(HttpStatus.BAD_REQUEST, e.getMessage());
    }
  }

  // 결제수단 삭제
public JsonNode deleteBillingKey(DeletePaymentMethodRequestDto req, String billingKey) {
    // 요청 URL 설정
    String requestUrl = API_HOSTNAME + "/billing-keys/" + billingKey
            + "?reason=" + UriUtils.encode(req.getReason(), StandardCharsets.UTF_8);

    // Header 설정
    HttpHeaders headers = new HttpHeaders();
    headers.set("Authorization", "PortOne " + API_SECRET);
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    try {
        ResponseEntity<String> response = restTemplate.exchange(
                requestUrl, HttpMethod.DELETE, entity, String.class);

        log.info("[PortOneClient] deleteBillingKey 응답 수신 상태: {}", response.getStatusCode());

        return objectMapper.readTree(response.getBody());

    } catch (HttpClientErrorException e) {
        // 예: 409 Conflict (이미 삭제된 빌링키 등)
        log.warn("[PortOneClient] PortOne API 오류: {}", e.getResponseBodyAsString());

        try {
            return objectMapper.readTree(e.getResponseBodyAsString());
        } catch (JsonProcessingException ex) {
            throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "포트원 오류 응답 파싱 실패", ex);
        }

    } catch (Exception e) {
        throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, "PortOne API 호출 실패", e);
    }
}


  private String generateWithTimestamp() {
    String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    String random = UUID.randomUUID().toString().substring(0, 6);
    return time + "_" + random;
  }
}
