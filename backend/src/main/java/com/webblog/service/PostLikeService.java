package com.webblog.service;

import com.webblog.entity.Post;
import com.webblog.entity.PostLike;
import com.webblog.entity.User;
import com.webblog.repository.PostLikeRepository;
import com.webblog.repository.PostRepository;
import com.webblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PostLikeService {
    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public boolean toggleLike(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User currentUser = getCurrentUser();
        
        boolean exists = postLikeRepository.existsByPostIdAndUserId(postId, currentUser.getId());
        
        if (exists) {
            postLikeRepository.deleteByPostIdAndUserId(postId, currentUser.getId());
            return false; // Unliked
        } else {
            PostLike like = new PostLike(post, currentUser);
            postLikeRepository.save(like);
            return true; // Liked
        }
    }

    public boolean isLikedByUser(Long postId, Long userId) {
        return postLikeRepository.existsByPostIdAndUserId(postId, userId);
    }

    public long getLikeCount(Long postId) {
        return postLikeRepository.countByPostId(postId);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

