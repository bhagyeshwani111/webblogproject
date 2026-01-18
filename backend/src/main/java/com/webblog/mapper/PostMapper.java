package com.webblog.mapper;

import com.webblog.dto.PostDto;
import com.webblog.entity.Post;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class PostMapper {
    @Autowired
    private UserMapper userMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    public PostDto toDto(Post post) {
        if (post == null) {
            return null;
        }
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setAuthor(userMapper.toDto(post.getAuthor()));
        dto.setCreatedAt(post.getCreatedAt());
        dto.setAuthorId(post.getAuthor().getId());
        dto.setCategories(post.getCategories().stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList()));
        return dto;
    }
}

