package com.webblog.repository;

import com.webblog.entity.Report;
import com.webblog.entity.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);
    List<Report> findAllByOrderByCreatedAtDesc();
    long countByStatus(ReportStatus status);
    List<Report> findByPostId(Long postId);
    List<Report> findByReporterId(Long reporterId);
}

