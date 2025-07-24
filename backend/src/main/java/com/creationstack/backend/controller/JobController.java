package com.creationstack.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.creationstack.backend.dto.member.JobResponse;
import com.creationstack.backend.service.JobService;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<JobResponse> getAllJobs() {
        try {
            JobResponse response = jobService.getAllJobs();
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("직업 목록 조회 중 오류 발생", e);
            JobResponse response = JobResponse.builder()
                    .success(false)
                    .build();
            return ResponseEntity.internalServerError().body(response);
        }
    }
}