import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import streamSaver from 'streamsaver';
import { useSearchParams } from 'react-router-dom';
import useAvatar from '../hooks/useAvatar';
import Notification from './Notification';

interface ServerToClientEvents {
	noArg: () => void;
	basicEmit: (a: number, b: string, c: Buffer) => void;
	withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
	hello: () => void;
}

const worker = new Worker('../../worker.js');

const Room = () => {
	const socketRef = useRef<Socket | null>(null);
	const peerRef = useRef(null);
	const inputRef = useRef(null);
	const otherUser = useRef(null);
	const remoteAvatar = useRef(null);
	const sendChannel = useRef(null);
	const [connectionEstablished, setConnection] = useState(false);
	const [file, setFile] = useState(null);
	const [gotFile, setGotFile] = useState(false);
	const fileNameRef = useRef('');
	const [searchParams] = useSearchParams();
	const roomID = searchParams.get('id');
	const { name, src } = useAvatar();

	console.log('myAvatar', { name, src });

	const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
		import.meta.env.VITE_API_URL
	);

	useEffect(() => {
		socketRef.current = socket.connect();
		socketRef.current.emit('join room', roomID);

		socketRef.current.on('other user', (userID) => {
			callUser(userID);
			otherUser.current = userID;
		});

		socketRef.current.on('user joined', (userID) => {
			otherUser.current = userID;
		});

		socketRef.current.on('other-details', (payload) => {
			console.log('other user name', payload.name, payload.src);
			remoteAvatar.current = payload;
		});

		socketRef.current.on('user-left', () => {
			setConnection(false);
			peerRef.current.close();
			remoteAvatar.current = null;
			otherUser.current = null;
			sendChannel.current = null;
		});

		socketRef.current.on('offer', handleOffer);

		socketRef.current.on('answer', handleAnswer);

		socketRef.current.on('ice-candidate', handleNewICECandidateMsg);
	}, []);

	function callUser(userID) {
		peerRef.current = createPeer(userID);
		socketRef.current.emit('my-details', { roomID, name, src });
		sendChannel.current = peerRef.current.createDataChannel('sendChannel');
		sendChannel.current.onopen = () => setConnection(true);
		sendChannel.current.onclose = () => setConnection(false);
		sendChannel.current.onmessage = handleReceivingData;
	}

	function createPeer(userID) {
		const peer = new RTCPeerConnection({
			iceServers: [
				{ urls: 'stun:stun.l.google.com:19302' },
				{ urls: 'stun:global.stun.twilio.com:3478' },
			],
		});

		peer.onicecandidate = handleICECandidateEvent;
		peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);
		return peer;
	}

	function handleNegotiationNeededEvent(userID) {
		peerRef.current
			.createOffer()
			.then((offer) => {
				return peerRef.current.setLocalDescription(offer);
			})
			.then(() => {
				const payload = {
					target: userID,
					caller: socketRef.current.id,
					sdp: peerRef.current.localDescription,
				};
				socketRef.current.emit('offer', payload);
			})
			.catch((e) => alert(e));
	}

	function handleOffer(incoming) {
		peerRef.current = createPeer(incoming.caller);
		socketRef.current.emit('my-details', { roomID, name, src });
		peerRef.current.ondatachannel = (e) => {
			sendChannel.current = e.channel;
			sendChannel.current.onopen = () => setConnection(true);
			sendChannel.current.onclose = () => setConnection(false);
			sendChannel.current.onmessage = handleReceivingData;
		};

		const desc = new RTCSessionDescription(incoming.sdp);
		peerRef.current
			.setRemoteDescription(desc)
			.then(() => {
				return peerRef.current.createAnswer();
			})
			.then((answer) => {
				return peerRef.current.setLocalDescription(answer);
			})
			.then(() => {
				const payload = {
					target: incoming.caller,
					caller: socketRef.current.id,
					sdp: peerRef.current.localDescription,
				};
				socketRef.current.emit('answer', payload);
			})
			.catch((e) => console.log(e));
	}

	function handleAnswer(message) {
		const desc = new RTCSessionDescription(message.sdp);
		peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
	}

	function handleICECandidateEvent(e) {
		if (e.candidate) {
			const payload = {
				target: otherUser.current,
				candidate: e.candidate,
			};
			socketRef.current.emit('ice-candidate', payload);
		}
	}

	function handleNewICECandidateMsg(incoming) {
		const candidate = new RTCIceCandidate(incoming);
		peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
	}

	function handleReceivingData(e) {
		if (e.data.toString().includes('done')) {
			setGotFile(true);
			const parsed = JSON.parse(e.data);
			fileNameRef.current = parsed.fileName;
		} else {
			worker.postMessage(e.data);
		}
	}

	function download() {
		setGotFile(false);
		worker.postMessage('download');
		worker.addEventListener('message', (event) => {
			const stream = event.data.stream();
			const fileStream = streamSaver.createWriteStream(fileNameRef.current);
			stream.pipeTo(fileStream);
		});
	}

	function selectFile(e) {
		setFile(e.target.files[0]);
	}

	function sendFile() {
		const stream = file.stream();
		const reader = stream.getReader();

		reader.read().then((obj) => {
			handlereading(obj.done, obj.value);
		});

		function handlereading(done, value) {
			if (done) {
				sendChannel.current.send(JSON.stringify({ done: true, fileName: file.name }));
				return;
			}
			sendChannel.current.send(value);
			reader.read().then((obj) => {
				handlereading(obj.done, obj.value);
			});
		}
		setFile(null);
	}

	return (
		<div className="h-full w-full p-4 flex flex-col ">
			<h2
				onClick={() => navigator.clipboard.writeText(roomID)}
				className="bg-white p-2 rounded-lg w-[480px] mx-auto text-center my-6 cursor-pointer"
			>
				Room ID: <span className="text-[#282828]">{roomID}</span>
			</h2>
			<div className="w-full max-w-2xl mt-32 mx-auto flex justify-between items-center">
				<div className="flex flex-col items-center gap-1">
					<img src={src} alt={`an image of ${name}`} className="h-16" />
					<h2 className="text-white text-sm font-medium">You</h2>
				</div>
				{connectionEstablished ? (
					<div className="flex flex-col items-center gap-1">
						<img
							src={remoteAvatar?.current.src}
							alt={`an image of ${name}`}
							className="h-16 cursor-pointer hover:scale-110 hover:border-2 hover:border-[#b32626] rounded-full transform transition-transform"
							onClick={() => inputRef.current.click()}
						/>
						<input onChange={selectFile} type="file" className="hidden" ref={inputRef} />
						<h2 className="text-white text-sm font-medium">{remoteAvatar?.current.name}</h2>
					</div>
				) : (
					<h2 className="text-white">No User Connected</h2>
				)}
			</div>

			{gotFile && (
				<Notification
					receivingFile={{
						handleClick: download,
						handleCancelClick: () => setGotFile(false),
					}}
				/>
			)}

			{file && (
				<Notification
					sendingFile={{
						file: file.name,
						handleClick: sendFile,
						handleCancelClick: () => setFile(null),
					}}
				/>
			)}
		</div>
	);
};

export default Room;
