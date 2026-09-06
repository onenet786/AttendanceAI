import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

let io: SocketIOServer | null = null;

export function initSocketServer(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Socket authentication middleware
  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
      socket.handshake.query?.token;

    if (!token) {
      return next(new Error('Socket authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token as string, config.JWT_SECRET) as {
        userId: string;
        tenantId: string;
      };
      socket.data.userId = decoded.userId;
      socket.data.tenantId = decoded.tenantId;
      return next();
    } catch (err) {
      return next(new Error('Socket authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const tenantId = socket.data.tenantId;
    if (tenantId) {
      socket.join(tenantId);
      console.log(`[Socket Connected]: User ${socket.data.userId} joined tenant room ${tenantId}`);
    }

    socket.on('disconnect', () => {
      // Disconnect handling
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
