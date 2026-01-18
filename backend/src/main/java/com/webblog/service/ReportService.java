package com.webblog.service;

import com.webblog.dto.ReportDto;
import com.webblog.entity.Comment;
import com.webblog.entity.Post;
import com.webblog.entity.Report;
import com.webblog.entity.ReportStatus;
import com.webblog.entity.User;
import com.webblog.mapper.UserMapper;
import com.webblog.repository.CommentRepository;
import com.webblog.repository.PostRepository;
import com.webblog.repository.ReportRepository;
import com.webblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReportService {
    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    public ReportDto createReport(ReportDto reportDto) {
        User currentUser = getCurrentUser();
        
        Report report = new Report();
        report.setReporter(currentUser);
        report.setReason(reportDto.getReason());
        report.setStatus(ReportStatus.PENDING);

        if (reportDto.getPostId() != null) {
            Post post = postRepository.findById(reportDto.getPostId())
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            report.setPost(post);
        }

        if (reportDto.getCommentId() != null) {
            Comment comment = commentRepository.findById(reportDto.getCommentId())
                    .orElseThrow(() -> new RuntimeException("Comment not found"));
            report.setComment(comment);
        }

        if (report.getPost() == null && report.getComment() == null) {
            throw new RuntimeException("Either postId or commentId must be provided");
        }

        Report savedReport = reportRepository.save(report);
        return toDto(savedReport);
    }

    public List<ReportDto> getAllReports() {
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        return reports.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ReportDto> getReportsByStatus(ReportStatus status) {
        List<Report> reports = reportRepository.findByStatusOrderByCreatedAtDesc(status);
        return reports.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public ReportDto updateReportStatus(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(status);
        Report updatedReport = reportRepository.save(report);
        return toDto(updatedReport);
    }

    public void deleteReport(Long reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new RuntimeException("Report not found");
        }
        reportRepository.deleteById(reportId);
    }

    private ReportDto toDto(Report report) {
        ReportDto dto = new ReportDto();
        dto.setId(report.getId());
        dto.setReporterId(report.getReporter().getId());
        dto.setReporter(userMapper.toDto(report.getReporter()));
        dto.setReason(report.getReason());
        dto.setStatus(report.getStatus());
        dto.setCreatedAt(report.getCreatedAt());
        
        if (report.getPost() != null) {
            dto.setPostId(report.getPost().getId());
        }
        
        if (report.getComment() != null) {
            dto.setCommentId(report.getComment().getId());
        }
        
        return dto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

