'use client';

import { useState } from 'react';
import { createShareLink } from '@/lib/services/shareService';
import { useNotificationStore } from '@/lib/utils/notificationStore';
import type { Movie } from '@/lib/types';

interface ShareButtonProps {
  favorites: Movie[];
  userId: string;
}

export default function ShareButton({ favorites, userId }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleShare = async () => {
    if (favorites.length === 0) {
      addNotification('Add some favorites before sharing', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await createShareLink(userId, favorites);

      if (!response.success || !response.shareUrl) {
        addNotification(response.error || 'Failed to create share link', 'error');
        return;
      }

      // Copy to clipboard
      await navigator.clipboard.writeText(response.shareUrl);
      setShowCopyFeedback(true);
      addNotification('Share link copied to clipboard!', 'success');

      // Reset feedback after 2 seconds
      setTimeout(() => {
        setShowCopyFeedback(false);
      }, 2000);
    } catch (err) {
      addNotification(
        err instanceof Error ? err.message : 'Failed to create share link',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading || favorites.length === 0}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
        loading || favorites.length === 0
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
          : showCopyFeedback
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
      }`}
      aria-label="Share favorites"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          <span>Creating link...</span>
        </>
      ) : showCopyFeedback ? (
        <>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C9.839 15.859 11.564 17.811 13.596 19.068m4.054-9.537A8.97 8.97 0 0113.596 19.068M9.26 6.818A7.967 7.967 0 0113.596 6.5c4.091 0 7.717 2.468 9.442 6.05M9.26 6.818A7.967 7.967 0 0116 5c4.091 0 7.717 2.468 9.442 6.05m0 0A8.968 8.968 0 0023 12a8.97 8.97 0 01-1.458 5.05m0 0A9.015 9.015 0 0112 23c-4.091 0-7.717-2.468-9.442-6.05m18.884-12.05A8.97 8.97 0 0012 5m0 0a8.97 8.97 0 00-9.442 6.05m0 0A9.015 9.015 0 001 12"
            />
          </svg>
          <span>Share Favorites</span>
        </>
      )}
    </button>
  );
}
