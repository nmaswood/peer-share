import { BsFillFileEarmarkFill } from 'react-icons/bs';

interface NotificationProps {
	sendingFile?: {
		file: string;
		handleClick: () => void;
		handleCancelClick: () => void;
	} | null;
	receivingFile?: {
		handleClick: () => void;
		handleCancelClick: () => void;
	} | null;
}

const Notification: React.FC<NotificationProps> = ({ sendingFile, receivingFile }) => {
	return (
		<div className=" bg-white w-[400px] rounded-xl p-2 flex items-center justify-center mx-auto my-2">
			<BsFillFileEarmarkFill size={50} />
			<div className="flex flex-col gap-2 ">
				{sendingFile && (
					<p className="text-xs font-medium ">Do you want to send "{sendingFile.file}"?</p>
				)}
				{receivingFile && (
					<p className="text-xs font-medium ">
						You have received a file. Would you like to download it?
					</p>
				)}

				<div className="space-x-2 text-xs text-right ">
					{sendingFile && (
						<button
							onClick={sendingFile.handleCancelClick}
							className="border-2 px-2 py-1 rounded-md"
						>
							Cancel
						</button>
					)}
					{receivingFile && (
						<button
							onClick={receivingFile.handleCancelClick}
							className="border-2 px-2 py-1 rounded-md"
						>
							Cancel
						</button>
					)}

					{sendingFile ? (
						<button onClick={sendingFile.handleClick} className="border-2 px-2 py-1 rounded-md">
							Send
						</button>
					) : receivingFile ? (
						<button onClick={receivingFile.handleClick} className="border-2 px-2 py-1 rounded-md">
							Download
						</button>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default Notification;
