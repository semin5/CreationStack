package com.creationstack.backend.exception;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

/*spring security, cors 등 예외 처리 추후 설정*/
@RestControllerAdvice
public class GlobalExceptionHandler {

  // IllegalArgumentException 처리
  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex){
    ErrorResponse error = new ErrorResponse(LocalDateTime.now(),HttpStatus.BAD_REQUEST.value(),HttpStatus.BAD_REQUEST.getReasonPhrase(),ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }

  // AccessDeniedException 처리
  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
    ErrorResponse error = new ErrorResponse(LocalDateTime.now(),HttpStatus.FORBIDDEN.value(),HttpStatus.FORBIDDEN.getReasonPhrase(),"접근 권한이 없습니다.");
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
  }

  // 유효성 검사 실패 (ex: @Valid)
  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Object> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex) {
    Map<String, String> fields = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error -> {
      fields.put(error.getField(), error.getDefaultMessage()); //
    });
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(fields);
  }

  // 쿼리 파라미터 누락 처리
  @ExceptionHandler(MissingServletRequestParameterException.class)
  public ResponseEntity<ErrorResponse> handleMissingServletRequestParameterException(MissingServletRequestParameterException ex) {
    ErrorResponse error = new ErrorResponse(LocalDateTime.now(),HttpStatus.BAD_REQUEST.value(),HttpStatus.BAD_REQUEST.getReasonPhrase(),ex.getParameterName()+"이 누락되었습니다.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }

  // 바디 누락 처리
  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
    ErrorResponse error = new ErrorResponse(LocalDateTime.now(),HttpStatus.BAD_REQUEST.value(),HttpStatus.BAD_REQUEST.getReasonPhrase(),"요청 바디 정보가 누락되었습니다.");
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
  }

  @ExceptionHandler(CustomException.class)
  public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex) {
    ErrorResponse error = new ErrorResponse(LocalDateTime.now(),ex.getStatus().value(),ex.getStatus().getReasonPhrase(),ex.getMessage());
    return ResponseEntity.status(ex.getStatus()).body(error);
  }


  // RestTemplate이 4xx 오류를 응답받을 때 사용됨
  @ExceptionHandler(HttpClientErrorException.class)
  public ResponseEntity<ErrorResponse> handleHttpClientError(HttpClientErrorException ex) {
    ErrorResponse error = new ErrorResponse(
        LocalDateTime.now(),
        ex.getStatusCode().value(),
        ex.getStatusText(),
        extractPortOneErrorMessage(ex.getResponseBodyAsString())
    );
    return ResponseEntity.status(ex.getStatusCode()).body(error);
  }

  // RestTemplate이 5xx 서버 오류 응답받을 때
  @ExceptionHandler(HttpServerErrorException.class)
  public ResponseEntity<ErrorResponse> handleHttpServerError(HttpServerErrorException ex) {
    ErrorResponse error = new ErrorResponse(
        LocalDateTime.now(),
        ex.getStatusCode().value(),
        ex.getStatusText(),
        "외부 결제 시스템 오류: " + extractPortOneErrorMessage(ex.getResponseBodyAsString())
    );
    return ResponseEntity.status(ex.getStatusCode()).body(error);
  }

  // 그외 모든 예외 처리
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleException(Exception ex) {
    ErrorResponse error = new ErrorResponse(LocalDateTime.now(),HttpStatus.INTERNAL_SERVER_ERROR.value(),HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),"서버 오류가 발생했습니다.");
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
  }

  // 포트원 응답 body에서 메세지 파싱
  private String extractPortOneErrorMessage(String responseBody) {
    try {
      JsonNode node = new ObjectMapper().readTree(responseBody);
      if (node.has("message")) {
        JsonNode messageNode = node.get("message");
        return messageNode.isTextual() ? messageNode.asText() : messageNode.toString();
      }
      return "에러 메시지를 찾을 수 없습니다.";
    } catch (Exception e) {
      return "에러 응답 파싱 실패";
    }
  }
}
