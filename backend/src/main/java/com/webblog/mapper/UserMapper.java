package com.webblog.mapper;

import com.webblog.dto.UserDto;
import com.webblog.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    /**
     * Maps User entity to UserDto.
     * IMPORTANT: This method ONLY accesses basic fields (id, name, email, role, enabled, isBlocked).
     * It NEVER accesses lazy-loaded relationships (posts, comments) to prevent LazyInitializationException.
     */
    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        
        UserDto dto = new UserDto();
        
        // Only map basic fields - NEVER access user.getPosts() or user.getComments()
        dto.setId(user.getId());
        dto.setName(user.getName() != null ? user.getName() : "");
        dto.setEmail(user.getEmail() != null ? user.getEmail() : "");
        dto.setRole(user.getRole() != null ? user.getRole() : com.webblog.entity.Role.ROLE_USER);
        dto.setEnabled(user.getEnabled() != null ? user.getEnabled() : true);
        
        // Safely handle isBlocked - use getter which handles null internally
        dto.setIsBlocked(user.getIsBlocked());
        
        return dto;
    }
}

