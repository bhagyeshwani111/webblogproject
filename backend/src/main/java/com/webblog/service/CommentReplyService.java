package com.webblog.service;

import com.webblog.dto.CommentReplyDto;
import com.webblog.entity.Comment;
import com.webblog.entity.CommentReply;
import com.webblog.entity.User;
import com.webblog.mapper.UserMapper;
import com.webblog.repository.CommentReplyRepository;
import com.webblog.repository.CommentRepository;
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
public class CommentReplyService {
    @Autowired
    private CommentReplyRepository commentReplyRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    public CommentReplyDto createReply(Long parentCommentId, CommentReplyDto replyDto) {
        Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));
        
        User currentUser = getCurrentUser();
        
        CommentReply reply = new CommentReply();
        reply.setParentComment(parentComment);
        reply.setAuthor(currentUser);
        reply.setContent(replyDto.getContent());
        
        CommentReply savedReply = commentReplyRepository.save(reply);
        return toDto(savedReply);
    }

    public List<CommentReplyDto> getRepliesByCommentId(Long parentCommentId) {
        List<CommentReply> replies = commentReplyRepository.findByParentCommentIdOrderByCreatedAtAsc(parentCommentId);
        return replies.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public void deleteReply(Long replyId) {
        CommentReply reply = commentReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        
        User currentUser = getCurrentUser();
        boolean isAdmin = currentUser.getRole().name().equals("ROLE_ADMIN");
        boolean isOwner = reply.getAuthor().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("You don't have permission to delete this reply");
        }

        commentReplyRepository.deleteById(replyId);
    }

    private CommentReplyDto toDto(CommentReply reply) {
        CommentReplyDto dto = new CommentReplyDto();
        dto.setId(reply.getId());
        dto.setParentCommentId(reply.getParentComment().getId());
        dto.setAuthor(userMapper.toDto(reply.getAuthor()));
        dto.setContent(reply.getContent());
        dto.setCreatedAt(reply.getCreatedAt());
        dto.setAuthorId(reply.getAuthor().getId());
        return dto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

