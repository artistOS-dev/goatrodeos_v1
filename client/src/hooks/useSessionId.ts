import { useState, useEffect } from 'react';

export const useSessionId = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('rodeo_session_id');
    if (!id) {
      id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('rodeo_session_id', id);
    }
    setSessionId(id);
  }, []);

  return sessionId;
};
