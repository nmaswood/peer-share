import Avatar from './Avatar';
import Notification from './Notification';
import { useRef } from 'react';

const Peer = () => {
	const fileRef = useRef<HTMLInputElement>(null);

	return (
		<div onClick={() => fileRef.current?.click()} className="relative ">
			<input ref={fileRef} type="file" name="" id="" className="hidden" />
			<div className="cursor-pointer flex flex-col justify-center items-center gap-3">
				<Avatar />
				<h2 className="text-white font-semibold text-lg">John Doe</h2>
			</div>
			<div className="absolute -right-[350px] top-0  ">
				<Notification />
			</div>
		</div>
	);
};

export default Peer;
