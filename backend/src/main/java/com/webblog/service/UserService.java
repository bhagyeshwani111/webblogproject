package com.webblog.service;

import com.webblog.dto.UserDto;
import com.webblog.entity.Role;
import com.webblog.entity.User;
import com.webblog.mapper.UserMapper;
import com.webblog.repository.PostRepository;
import com.webblog.repository.ReportRepository;
import com.webblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ReportRepository reportRepository;

    public UserDto registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.ROLE_USER);
        user.setEnabled(true);
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        System.out.println("[DEBUG] UserService.getAllUsers() called");
        
        try {
            // First check total count
            long totalCount = userRepository.count();
            System.out.println("[DEBUG] Total users in database: " + totalCount);
            
            if (totalCount == 0) {
                System.out.println("[WARNING] Database has no users!");
                return new java.util.ArrayList<>();
            }
            
            // Use safe query method that doesn't trigger lazy loading
            List<User> users = userRepository.findAllUsersWithoutRelations();
            
            System.out.println("[DEBUG] Repository returned " + users.size() + " users");
            
            // Fallback: if custom query returns empty but count > 0, try standard findAll
            if (users.isEmpty() && totalCount > 0) {
                System.out.println("[WARNING] Custom query returned empty, trying findAll()");
                users = userRepository.findAll();
                System.out.println("[DEBUG] findAll() returned " + users.size() + " users");
            }
            
            if (users.isEmpty() && totalCount > 0) {
                System.out.println("[ERROR] Both queries returned empty despite count > 0!");
            }
            
            List<UserDto> userDtos = users.stream()
                    .map(user -> {
                        try {
                            UserDto dto = userMapper.toDto(user);
                            if (dto != null) {
                                System.out.println("[DEBUG] Mapped user: " + user.getId() + " (" + user.getEmail() + ") -> OK");
                            } else {
                                System.out.println("[ERROR] Mapper returned NULL for user: " + user.getId());
                            }
                            return dto;
                        } catch (Exception e) {
                            System.err.println("[ERROR] Error mapping user " + user.getId() + ": " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            System.out.println("[DEBUG] Successfully mapped " + userDtos.size() + " users to DTOs");
            
            return userDtos;
        } catch (Exception e) {
            System.err.println("[ERROR] Error fetching all users: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to fetch users: " + e.getMessage(), e);
        }
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDto(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Delete all reports related to user's posts first
        List<com.webblog.entity.Post> userPosts = postRepository.findAll().stream()
                .filter(post -> post.getAuthor().getId().equals(id))
                .collect(Collectors.toList());

        for (com.webblog.entity.Post post : userPosts) {
            // Delete reports for this post
            List<com.webblog.entity.Report> reportsToDelete = reportRepository.findByPostId(post.getId());
            if (!reportsToDelete.isEmpty()) {
                reportRepository.deleteAll(reportsToDelete);
            }
        }

        // Delete user's posts (which will cascade delete comments)
        postRepository.deleteAll(userPosts);

        // Delete reports where user is the reporter
        List<com.webblog.entity.Report> reporterReports = reportRepository.findByReporterId(id);
        if (!reporterReports.isEmpty()) {
            reportRepository.deleteAll(reporterReports);
        }

        // Finally delete the user
        userRepository.deleteById(id);
    }

    public UserDto toggleBlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsBlocked(!user.getIsBlocked());
        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

