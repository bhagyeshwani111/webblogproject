package com.webblog.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        final String authorizationHeader = request.getHeader("Authorization");
        final String requestPath = request.getRequestURI();

        // Debug logging for admin endpoints
        if (requestPath != null && requestPath.contains("/api/users")) {
            System.out.println("[JWT FILTER] Processing request: " + requestPath);
            System.out.println("[JWT FILTER] Authorization header present: " + (authorizationHeader != null));
        }

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                if (requestPath != null && requestPath.contains("/api/users")) {
                    System.out.println("[JWT FILTER] Extracted username: " + username);
                }
            } catch (Exception e) {
                logger.error("JWT token parsing error", e);
                if (requestPath != null && requestPath.contains("/api/users")) {
                    System.err.println("[JWT FILTER] Token parsing failed: " + e.getMessage());
                }
            }
        } else if (requestPath != null && requestPath.contains("/api/users")) {
            System.out.println("[JWT FILTER] WARNING: No Authorization header found for admin endpoint");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                
                if (requestPath != null && requestPath.contains("/api/users")) {
                    System.out.println("[JWT FILTER] Authentication set successfully");
                    System.out.println("[JWT FILTER] User authorities: " + userDetails.getAuthorities());
                }
            } else {
                if (requestPath != null && requestPath.contains("/api/users")) {
                    System.err.println("[JWT FILTER] Token validation failed");
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}

