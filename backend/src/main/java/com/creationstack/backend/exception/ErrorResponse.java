package com.creationstack.backend.exception;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class ErrorResponse {
  private LocalDateTime timestamp; //응답 발생 시각
  private int status; //HTTP 상태코드
  private String error; //개발자에게 보여주는 메세지
  private String message; //사용자에게 보여주는 메세지
}
