'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChatProvider } from '@/lib/chat-context';
import ChatWidget from './chat-widget';

/**
 * Client wrapper for ChatProvider + ChatWidget.
 * Only renders on non-admin pages AND when chatbot is enabled in config.
 */
export default function ChatWrapper() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/chat/status')
      .then((res) => res.json())
      .then((data) => setEnabled(data.enabled))
      .catch(() => setEnabled(false));
  }, []);

  // Don't render chat widget on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Wait for config or hide if disabled
  if (!enabled) {
    return null;
  }

  return (
    <ChatProvider>
      <ChatWidget />
    </ChatProvider>
  );
}
