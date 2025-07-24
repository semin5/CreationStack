package com.creationstack.backend.dto.member;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class JobResponse {
    private boolean success;
    private List<JobInfo> data;

    @Data
    @Builder
    public static class JobInfo {
        private Integer jobId;
        private String name;
    }
}
