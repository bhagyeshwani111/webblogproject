package com.webblog.service;

import com.webblog.entity.AuditLog;
import com.webblog.entity.User;
import com.webblog.repository.AuditLogRepository;
import com.webblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    public void logAction(String action, String entityType, Long entityId) {
        User actor = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
                actor = userRepository.findByEmail(authentication.getName()).orElse(null);
            }
        } catch (Exception e) {
            // Ignore if user not found or not authenticated
        }

        AuditLog log = new AuditLog(actor, action, entityType, entityId);
        auditLogRepository.save(log);
    }
}

