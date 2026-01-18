package com.webblog.controller;

import com.webblog.dto.SavedPostDto;
import com.webblog.service.SavedPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/saved-posts")
@CrossOrigin(origins = "http://localhost:5173")
public class SavedPostController {
    @Autowired
    private SavedPostService savedPostService;

    @PostMapping("/{postId}/toggle")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleSave(@PathVariable Long postId) {
        boolean saved = savedPostService.toggleSave(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("saved", saved);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-saved")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<SavedPostDto>> getMySavedPosts() {
        return ResponseEntity.ok(savedPostService.getCurrentUserSavedPosts());
    }

    @GetMapping("/{postId}/is-saved")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> isSaved(@PathVariable Long postId, @RequestParam Long userId) {
        boolean isSaved = savedPostService.isSavedByUser(postId, userId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("isSaved", isSaved);
        return ResponseEntity.ok(response);
    }
}

