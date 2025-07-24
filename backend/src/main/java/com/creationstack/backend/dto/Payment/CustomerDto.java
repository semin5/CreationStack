package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// 고객 정보 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDto {
  private String id;
  private String email;
  private Name name;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  public static class Name {
    private String full;
    public String getTotal() { return full; }
    public void setTotal(String full) { this.full = full; }

  }
}
