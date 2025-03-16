import { Server as NetServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';

interface SocketServer extends NetServer {
  io?: SocketServer;
}

interface SocketResponse extends NextApiResponse {
  socket: {
    server: SocketServer;
  };
}

const ioHandler = (req: NextApiRequest, res: SocketResponse) => {
  if (!res.socket.server.io) {
    const io = new SocketServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    
    res.socket.server.io = io;

    io.on('connection', socket => {
      console.log('Cliente conectado');

      socket.on('join', (userId: string) => {
        console.log('Usuario unido:', userId);
        socket.join(`user-${userId}`);
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado');
      });
    });
  }

  res.end();
};

export const GET = ioHandler; 