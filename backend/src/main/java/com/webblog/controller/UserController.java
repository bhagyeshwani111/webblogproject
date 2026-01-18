package com.webblog.controller;

import com.webblog.dto.UserDto;
import com.webblog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> testAdminAccess() {
        System.out.println(">>> ADMIN USERS TEST ENDPOINT HIT");
        Map<String, String> response = new HashMap<>();
        response.put("status", "ADMIN ACCESS OK");
        response.put("message", "Security configuration is working correctly");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        System.out.println(">>> ADMIN USERS CONTROLLER HIT");
        System.out.println("[DEBUG] getAllUsers endpoint called");
        
        try {
            // Log authentication context
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                System.out.println("[DEBUG] Authenticated user: " + auth.getName());
                System.out.println("[DEBUG] Authorities: " + auth.getAuthorities());
            } else {
                System.out.println("[DEBUG] WARNING: No authentication found!");
            }
            
            List<UserDto> users = userService.getAllUsers();
            
            System.out.println("[DEBUG] Controller received " + users.size() + " user DTOs");
            System.out.println("[DEBUG] Returning ResponseEntity with user list");
            
            // Ensure we're returning DTOs, not entities
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("[ERROR] Error in getAllUsers controller: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response with details for debugging
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch users");
            error.put("message", e.getMessage());
            error.put("exception", e.getClass().getName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle-block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> toggleBlockUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleBlockUser(id));
    }
}

