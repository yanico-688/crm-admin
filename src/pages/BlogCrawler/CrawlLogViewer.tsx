import React, { useEffect, useRef, useState } from 'react';
import { Card } from 'antd';

const CrawlLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://43.128.150.131:8082/ws/`); // ⚠️ 改成你的后端地址

    ws.onmessage = (event) => {
      setLogs((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      console.log('WebSocket 连接关闭');
    };

    return () => ws.close();
  }, []);

  // 自动滚动到底部（只在日志容器里滚）
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <Card
      title="🐞 爬虫实时日志"
      size="small"
      style={{
        marginBottom: 16,
        borderRadius: 12,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
      bodyStyle={{
        padding: 0, // 👈 把滚动容器放到内部
      }}
    >
      <div
        ref={logBoxRef}
        style={{
          maxHeight: 300,
          overflowY: 'auto',
          background: '#1e1e1e',
          color: '#0f0',
          fontFamily: 'monospace',
          fontSize: 13,
          padding: '8px 12px',
          borderRadius: 8,
        }}
      >
        {logs.length === 0 && <div style={{ color: '#888' }}>暂无日志...</div>}
        {logs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </Card>
  );
};

export default CrawlLogViewer;
