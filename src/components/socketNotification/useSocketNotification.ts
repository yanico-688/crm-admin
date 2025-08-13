// import {useEffect} from 'react';
// import io, {Socket} from 'socket.io-client';
//
// interface SocketConfig {
//   eventName: string;
//   initialEmitEvent?: string;
//   onDataReceived: (data: any) => void;
// }
//
// export const useSocketNotification = (
//   configs: SocketConfig[],
//   email: string,
// ) => {
//
//   useEffect(() => {
//     if (!email) return; // 未登录时不建立连接
//     const SOCKET_URL = process.env.UMI_APP_SOCKET_URL || 'http://localhost:5003';
//     const socket: Socket = io(SOCKET_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionAttempts: 5,
//       withCredentials: true,
//       // 👇 添加这一块：通过 auth 传递身份信息
//       auth: {
//         role: 'admin',
//         email
//       },
//     });
//     socket.on('connect', () => {
//       console.log('✅ socket connected');
//
//       setTimeout(() => {
//         socket.emit('updatedInit');
//       }, 300);
//
//     });
//
//     // Set up listeners for each configuration
//     configs.forEach((config) => {
//       socket.on(config.eventName, config.onDataReceived);
//     });
//
//     // Handle socket disconnection
//     socket.on('disconnect', (reason) => {
//       console.log('Socket disconnected, reason:', reason);
//     });
//
//     // Handle connection errors
//     socket.on('connect_error', (error: Error) => {
//       console.error('Socket.IO connection error:', error);
//     });
//
//     // Optional: Listen to reconnection events
//     socket.on('reconnect_attempt', (attempt: number) => {
//       console.log(`Socket.IO reconnection attempt ${attempt}`);
//     });
//
//     socket.on('reconnect_failed', () => {
//       console.log('Socket.IO reconnection failed');
//     });
//
//     // Listen to 'message' event (if needed)
//     socket.on('message', (data: any) => {
//       console.log("Received 'message' event:", data);
//     });
//
//     // Cleanup function to remove all listeners and disconnect the socket
//     return () => {
//       configs.forEach((config) => {
//         socket.off(config.eventName, config.onDataReceived);
//       });
//       socket.disconnect();
//     };
//   }, [email]);
// };
