package com.webblog.service;

import com.webblog.dto.PostDto;
import com.webblog.entity.Category;
import com.webblog.entity.Post;
import com.webblog.entity.User;
import com.webblog.mapper.PostMapper;
import com.webblog.repository.CategoryRepository;
import com.webblog.repository.PostRepository;
import com.webblog.repository.ReportRepository;
import com.webblog.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ReportRepository reportRepository;

    public List<PostDto> getAllPosts() {
        return postRepository.findAllOrderByCreatedAtDesc().stream()
                .map(postMapper::toDto)
                .collect(Collectors.toList());
    }

    public PostDto getPostById(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return postMapper.toDto(post);
    }

    public PostDto createPost(PostDto postDto) {
        User currentUser = getCurrentUser();
        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        post.setAuthor(currentUser);
        
        // Handle categories if provided (support both categoryIds and categories array)
        List<Category> categories = new ArrayList<>();
        if (postDto.getCategoryIds() != null && !postDto.getCategoryIds().isEmpty()) {
            // Handle categoryIds array
            for (Long categoryId : postDto.getCategoryIds()) {
                categoryRepository.findById(categoryId)
                        .ifPresent(categories::add);
            }
        } else if (postDto.getCategories() != null && !postDto.getCategories().isEmpty()) {
            // Handle categories array (for backward compatibility)
            for (com.webblog.dto.CategoryDto categoryDto : postDto.getCategories()) {
                if (categoryDto.getId() != null) {
                    categoryRepository.findById(categoryDto.getId())
                            .ifPresent(categories::add);
                }
            }
        }
        if (!categories.isEmpty()) {
            post.setCategories(categories);
        }
        
        Post savedPost = postRepository.save(post);
        return postMapper.toDto(savedPost);
    }

    public PostDto updatePost(Long id, PostDto postDto) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole().name().equals("ROLE_ADMIN");
        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You don't have permission to edit this post");
        }

        post.setTitle(postDto.getTitle());
        post.setContent(postDto.getContent());
        Post updatedPost = postRepository.save(post);
        return postMapper.toDto(updatedPost);
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole().name().equals("ROLE_ADMIN");
        boolean isOwner = post.getAuthor().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You don't have permission to delete this post");
        }

        // Delete related reports first to avoid foreign key constraint violation
        List<com.webblog.entity.Report> reportsToDelete = reportRepository.findByPostId(id);
        if (!reportsToDelete.isEmpty()) {
            reportRepository.deleteAll(reportsToDelete);
        }

        postRepository.deleteById(id);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

