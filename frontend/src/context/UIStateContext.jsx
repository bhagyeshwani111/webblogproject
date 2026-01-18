import React, { createContext, useState } from 'react';

export const UIStateContext = createContext();

export const UIStateProvider = ({ children }) => {
  // Blocked users (UI-only state, session-based, resets on refresh)
  const [blockedUsers, setBlockedUsers] = useState(new Set());

  // Flagged posts (UI-only state, session-based, resets on refresh)
  const [flaggedPosts, setFlaggedPosts] = useState(new Set());

  const blockUser = (userId) => {
    setBlockedUsers(prev => new Set(prev).add(userId));
  };

  const unblockUser = (userId) => {
    setBlockedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  };

  const isUserBlocked = (userId) => {
    return blockedUsers.has(userId);
  };

  const flagPost = (postId) => {
    setFlaggedPosts(prev => new Set(prev).add(postId));
  };

  const unflagPost = (postId) => {
    setFlaggedPosts(prev => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });
  };

  const isPostFlagged = (postId) => {
    return flaggedPosts.has(postId);
  };

  return (
    <UIStateContext.Provider
      value={{
        blockedUsers: Array.from(blockedUsers),
        flagPost,
        unflagPost,
        isPostFlagged,
        blockUser,
        unblockUser,
        isUserBlocked
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
};

