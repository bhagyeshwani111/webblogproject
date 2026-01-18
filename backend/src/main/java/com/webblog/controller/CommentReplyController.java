package com.webblog.controller;

import com.webblog.dto.CommentReplyDto;
import com.webblog.service.CommentReplyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment-replies")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentReplyController {
    @Autowired
    private CommentReplyService commentReplyService;

    @GetMapping("/comment/{parentCommentId}")
    public ResponseEntity<List<CommentReplyDto>> getRepliesByCommentId(@PathVariable Long parentCommentId) {
        return ResponseEntity.ok(commentReplyService.getRepliesByCommentId(parentCommentId));
    }

    @PostMapping("/comment/{parentCommentId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<CommentReplyDto> createReply(
            @PathVariable Long parentCommentId,
            @Valid @RequestBody CommentReplyDto replyDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(commentReplyService.createReply(parentCommentId, replyDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReply(@PathVariable Long id) {
        commentReplyService.deleteReply(id);
        return ResponseEntity.noContent().build();
    }
}

