import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, XAIExplanation } from '../types';
import { generateXAIResponse, APIError } from '../utils/api';

export const useChat = (initialScenario: any) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const logEvent = useCallback((type: ChatMessage['type'], details: ChatMessage['details']) => {
    const newMessage: ChatMessage = {
      timestamp: new Date().toISOString(),
      type,
      details
    };
    setChatHistory(prev => [...prev, newMessage]);
  }, []);

  const sendMessage = useCallback(async (message: string): Promise<XAIExplanation | null> => {
    if (!message.trim() || isLoading) return null;
    
    setError(null);
    logEvent('user_query', { query: message });
    setIsLoading(true);

    try {
      const response = await generateXAIResponse(message, initialScenario);
      logEvent('ai_response', { question: message, response });
      return response;
    } catch (err) {
      const errorMessage = err instanceof APIError 
        ? err.message 
        : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, logEvent, initialScenario]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return {
    chatHistory,
    isLoading,
    error,
    sendMessage,
    logEvent,
    chatContainerRef,
    clearError: () => setError(null)
  };
};