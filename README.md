
# PEER-SHARE

Peer Share is a file sharing app that uses peer-to-peer (P2P) communication. The connection is initiated via a signaling server that handles the initial socket connections. Once connected, peers can communicate directly without further server intervention. The files are not saved at any server, rather they are directly shared between the peers.

## Features

- **File Sharing**: Seamlessly share files between two users.
- **WebRTC Integration**: Leverages WebRTC for peer-to-peer connections.
- **Socket Server**: Uses a socket server for signaling to establish connections.
- **HTTPS Support**: Runs on HTTPS for secure communication.






## Running the App

1. Clone repo and install dependencies inside server and client directory.


```bash
  cd server
  npm install 
  npm run dev
```

```bash
  cd client
  npm install 
  npm run dev
```
 2. Please note that the client will only be accessible at https i.e. https://localhost:5173/  
## HTTPS Configuration

The frontend uses vite-plugin-mkcert to enable HTTPS. This ensures that all communications are secure. Make sure to trust the generated certificates in your development environment.
