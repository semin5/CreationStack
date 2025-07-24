package com.creationstack.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.creationstack.backend.domain.user.Job;
import com.creationstack.backend.domain.user.JobType;
import com.creationstack.backend.repository.JobRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class JobDataLoader implements CommandLineRunner {

    private final JobRepository jobRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("직업 데이터 초기화를 시작합니다...");

        int addedCount = 0;

        // Enum의 모든 JobType을 순회하면서 DB에 없으면 추가
        for (JobType jobType : JobType.values()) {
            if (!jobRepository.existsByJobType(jobType)) {
                Job job = Job.fromJobType(jobType);
                jobRepository.save(job);
                log.debug("직업 추가: {} ({})", jobType.getDisplayName(), jobType.name());
                addedCount++;
            }
        }

        if (addedCount > 0) {
            log.info("직업 데이터 초기화가 완료되었습니다. {}개의 새로운 직업이 추가되었습니다.", addedCount);
        } else {
            log.info("모든 직업 데이터가 이미 존재합니다. 추가된 직업이 없습니다.");
        }

        log.info("현재 총 {}개의 직업이 등록되어 있습니다.", jobRepository.count());
    }
}