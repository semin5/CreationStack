package com.creationstack.backend.service;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.creationstack.backend.domain.user.Job;
import com.creationstack.backend.repository.JobRepository;

import java.util.List;
import java.util.stream.Collectors;

import com.creationstack.backend.dto.member.JobResponse;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobService {

        private final JobRepository jobRepository;

        public JobResponse getAllJobs() {
                List<Job> jobs = jobRepository.findAllByOrderByNameAsc();

                List<JobResponse.JobInfo> jobInfos = jobs.stream()
                                .map(job -> JobResponse.JobInfo.builder()
                                                .jobId(job.getJobId())
                                                .name(job.getName())
                                                .build())
                                .collect(Collectors.toList());

                return JobResponse.builder()
                                .success(true)
                                .data(jobInfos)
                                .build();
        }
}