import express , {Express, Request, Response } from  'express';
import cors from 'cors';
import http from 'http';
import { Socket } from 'socket.io';
const app = express();
const port = 8000;
const server = http.createServer(app);
app.use(cors());
app.use(express.json());


// interface ServerToClientEvents {
//     noArg: () => void;
//     basicEmit: (a: number, b: string, c: Buffer) => void;
//     withAck: (d: string, callback: (e: number) => void) => void;
//   }
  
//   interface ClientToServerEvents {
//     hello: () => void;
//   }
  
//   interface InterServerEvents {
//     ping: () => void;
//   }
  
//   interface SocketData {
//     name: string;
//     age: number;
//   }


const io = require('socket.io')(server , {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
}); 

interface Users {
  [key: string] : string[]
}

interface SocketToRoom {
  [key: string] : string
}

const users: Users   = {};
const socketToRoom : SocketToRoom = {};


io.on("connection", (socket:Socket) => {
  socket.on("join room", roomID => {
      if (users[roomID]) {
          users[roomID].push(socket.id);
      } else {
          users[roomID] = [socket.id];
      }
      socketToRoom[socket.id] = roomID;
      const otherUser = users[roomID].find(id => id !== socket.id);
      if (otherUser) {
          socket.emit("other user", otherUser);
          socket.to(otherUser).emit("user joined", socket.id);
      }
      console.log('users', users);
  });

  socket.on("my-details", (payload) => {
       console.log('my-details ran', payload);
         const roomID = socketToRoom[socket.id] 
        const otherUser = users[roomID].find(id => id !== socket.id);
        if (otherUser) {
            socket.to(otherUser).emit("other-details", payload);
        }
  });


  socket.on("offer", payload => {
      io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", payload => {
      io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", incoming => {
      io.to(incoming.target).emit("ice-candidate", incoming.candidate);
  });

  socket.on('disconnect', () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
        room = room.filter(id => id !== socket.id);
        users[roomID] = room;
        socket.broadcast.emit('user-left', socket.id);
    }
    console.log('user left' + socket.id);
    console.log('users', users);
  });
});








/*
io.on('connection', (socket:Socket) => {
  socket.on("join room", roomID => {
      if (users[roomID]) {
          const length = users[roomID].length;
          if (length === 2) {
              socket.emit("room full");
              return;
          }
          users[roomID].push(socket.id);
      } else {
          users[roomID] = [socket.id];
      }
      socketToRoom[socket.id] = roomID;
      const usersInThisRoom = users[roomID].filter(id => id !== socket.id);
      socket.emit("all users", usersInThisRoom);
      console.log('users in this room' + usersInThisRoom);
  });

  socket.on("sending signal", payload => {
      io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
      console.log('user joined' + payload.userToSignal);
    });

  socket.on("returning signal", payload => {
      io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
      console.log('receiving returned signal' + payload.callerID);
    });

  socket.on('disconnect', () => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];
      if (room) {
          room = room.filter(id => id !== socket.id);
          users[roomID] = room;
          socket.broadcast.emit('user left', socket.id);
      }
      console.log('user left' + socket.id);
    });

});
*/


server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



