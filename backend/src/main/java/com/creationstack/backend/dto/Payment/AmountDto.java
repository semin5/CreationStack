package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AmountDto {
  private int total;

  public int getTotal() { return total; }
  public void setTotal(int total) { this.total = total; }
}
