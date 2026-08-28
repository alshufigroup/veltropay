import { useState, useEffect } from 'react';
import { getWebSocketUrl } from '../api';

export const useRealtimeBalance = (accountNumber: string | null) => {
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!accountNumber) return;

    const ws = new WebSocket(getWebSocketUrl(accountNumber));

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.new_balance !== undefined) {
          setBalance(data.new_balance);
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [accountNumber]);

  return balance;
};
