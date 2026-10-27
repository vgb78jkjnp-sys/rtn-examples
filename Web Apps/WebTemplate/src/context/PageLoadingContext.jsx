import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import PageLoadingOverlay from '../components/PageLoadingOverlay';
import '../components/PageLoadingOverlay.css';

const DEFAULT_MESSAGE = 'Loading data...';

const PageLoadingContext = createContext(null);

export function PageLoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessageState] = useState(DEFAULT_MESSAGE);
  const activeRequestCountRef = useRef(0);
  const messageRef = useRef(DEFAULT_MESSAGE);

  const setMessage = useCallback((nextMessage) => {
    if (!nextMessage?.trim()) {
      if (activeRequestCountRef.current === 0) {
        messageRef.current = DEFAULT_MESSAGE;
        setMessageState(DEFAULT_MESSAGE);
      }

      return;
    }

    const resolvedMessage = nextMessage;
    messageRef.current = resolvedMessage;
    setMessageState(resolvedMessage);
  }, []);

  const begin = useCallback((nextMessage) => {
    if (nextMessage?.trim()) {
      setMessage(nextMessage);
    }

    activeRequestCountRef.current += 1;
    setMessageState(messageRef.current);
    setVisible(true);
  }, [setMessage]);

  const end = useCallback(() => {
    activeRequestCountRef.current = Math.max(0, activeRequestCountRef.current - 1);

    if (activeRequestCountRef.current === 0) {
      setVisible(false);
      messageRef.current = DEFAULT_MESSAGE;
      setMessageState(DEFAULT_MESSAGE);
    }
  }, []);

  const setProcessing = useCallback((isProcessing) => {
    if (isProcessing) {
      activeRequestCountRef.current += 1;
      setMessageState(messageRef.current);
      setVisible(true);
      return;
    }

    end();
  }, [end]);

  const value = useMemo(() => ({
    begin,
    end,
    setMessage,
    setProcessing,
    createProcessingAdapter: () => ({
      setMessage,
      setIsProcessing: setProcessing
    })
  }), [begin, end, setMessage, setProcessing]);

  return (
    <PageLoadingContext.Provider value={value}>
      {children}
      <PageLoadingOverlay visible={visible} message={message} />
    </PageLoadingContext.Provider>
  );
}

export function usePageLoading() {
  const context = useContext(PageLoadingContext);

  if (!context) {
    throw new Error('usePageLoading must be used within a PageLoadingProvider');
  }

  return context;
}
