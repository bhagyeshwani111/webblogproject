package com.webblog.controller;

import com.webblog.service.PostLikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/post-likes")
@CrossOrigin(origins = "http://localhost:5173")
public class PostLikeController {
    @Autowired
    private PostLikeService postLikeService;

    @PostMapping("/{postId}/toggle")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable Long postId) {
        boolean liked = postLikeService.toggleLike(postId);
        long likeCount = postLikeService.getLikeCount(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/count")
    public ResponseEntity<Map<String, Long>> getLikeCount(@PathVariable Long postId) {
        long count = postLikeService.getLikeCount(postId);
        Map<String, Long> response = new HashMap<>();
        response.put("likeCount", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{postId}/is-liked")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> isLiked(@PathVariable Long postId, @RequestParam Long userId) {
        boolean isLiked = postLikeService.isLikedByUser(postId, userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isLiked", isLiked);
        return ResponseEntity.ok(response);
    }
}

