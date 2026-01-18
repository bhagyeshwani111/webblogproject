package com.webblog.service;

import com.webblog.dto.AdminStatsDto;
import com.webblog.entity.ReportStatus;
import com.webblog.repository.CommentRepository;
import com.webblog.repository.PostRepository;
import com.webblog.repository.ReportRepository;
import com.webblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReportRepository reportRepository;

    public AdminStatsDto getStats() {
        long totalUsers = userRepository.count();
        long totalPosts = postRepository.count();
        long totalComments = commentRepository.count();
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);

        return new AdminStatsDto(totalUsers, totalPosts, totalComments, totalReports, pendingReports);
    }
}

