package com.webblog.service;

import com.webblog.dto.SavedPostDto;
import com.webblog.entity.Post;
import com.webblog.entity.SavedPost;
import com.webblog.entity.User;
import com.webblog.mapper.PostMapper;
import com.webblog.repository.PostRepository;
import com.webblog.repository.SavedPostRepository;
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
public class SavedPostService {
    @Autowired
    private SavedPostRepository savedPostRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostMapper postMapper;

    public boolean toggleSave(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User currentUser = getCurrentUser();
        
        boolean exists = savedPostRepository.existsByUserIdAndPostId(currentUser.getId(), postId);
        
        if (exists) {
            savedPostRepository.deleteByUserIdAndPostId(currentUser.getId(), postId);
            return false; // Unsaved
        } else {
            SavedPost savedPost = new SavedPost(currentUser, post);
            savedPostRepository.save(savedPost);
            return true; // Saved
        }
    }

    public boolean isSavedByUser(Long postId, Long userId) {
        return savedPostRepository.existsByUserIdAndPostId(userId, postId);
    }

    public List<SavedPostDto> getSavedPostsByUser(Long userId) {
        List<SavedPost> savedPosts = savedPostRepository.findByUserIdOrderBySavedAtDesc(userId);
        return savedPosts.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<SavedPostDto> getCurrentUserSavedPosts() {
        User currentUser = getCurrentUser();
        return getSavedPostsByUser(currentUser.getId());
    }

    private SavedPostDto toDto(SavedPost savedPost) {
        SavedPostDto dto = new SavedPostDto();
        dto.setId(savedPost.getId());
        dto.setUserId(savedPost.getUser().getId());
        dto.setPost(postMapper.toDto(savedPost.getPost()));
        dto.setSavedAt(savedPost.getSavedAt());
        return dto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

