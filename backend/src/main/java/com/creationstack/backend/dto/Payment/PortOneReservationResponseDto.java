package com.creationstack.backend.dto.Payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//포트원 결제예약 응답 dto
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PortOneReservationResponseDto {
  private ScheduleDto schedule;

  @Getter
  @Setter
  @AllArgsConstructor
  @NoArgsConstructor
  public static class ScheduleDto {
    private String id;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
  }
}
