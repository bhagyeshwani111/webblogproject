package com.webblog.controller;

import com.webblog.dto.AuthRequestDto;
import com.webblog.dto.AuthResponseDto;
import com.webblog.dto.UserDto;
import com.webblog.entity.User;
import com.webblog.mapper.UserMapper;
import com.webblog.security.JwtUtil;
import com.webblog.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody User user) {
        userService.registerUser(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful. Please login.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody AuthRequestDto request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        User user = userService.findByEmail(request.getEmail());
        String token = jwtUtil.generateTokenWithRole(userDetails, user.getRole().name());
        
        UserDto userDto = userMapper.toDto(user);
        AuthResponseDto response = new AuthResponseDto(token, userDto);
        return ResponseEntity.ok(response);
    }
}

