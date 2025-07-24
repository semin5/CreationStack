package com.creationstack.backend.exception;

import org.springframework.http.HttpStatus;

public class CustomException extends RuntimeException {
  private final HttpStatus status;

  public CustomException(HttpStatus status, String message) {
    super(message);
    this.status = status;
  }
  
  // 새로운 생성자 추가: Throwable (예외의 원인)을 인자로 받음
    public CustomException(HttpStatus status, String message, Throwable cause) {
        super(message, cause); // RuntimeException의 생성자로 메시지와 원인을 전달
        this.status = status;
    }

  public HttpStatus getStatus() {
    return status;
  }

  @Override
  public String getMessage() {
    return super.getMessage();
  }
}
