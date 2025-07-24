package com.creationstack.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.creationstack.backend.domain.user.Job;
import com.creationstack.backend.domain.user.JobType;

@Repository
public interface JobRepository extends JpaRepository<Job, Integer> {
    List<Job> findAllByOrderByNameAsc();

    boolean existsByName(String name);

    boolean existsByJobType(JobType jobType);

    Optional<Job> findByName(String name);

    Optional<Job> findByJobType(JobType jobType);
}