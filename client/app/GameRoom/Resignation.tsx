import React, { useState } from "react";
import { LiaFlagCheckeredSolid } from "react-icons/lia";
import { Socket } from "socket.io-client";

type resignProps = {
	socket: Socket;
	winnerName: string;
};

export const Resignation = ({ socket, winnerName }: resignProps) => {
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleButtonClick = () => {
		setShowConfirmation(true);
	};

	const handleConfirmation = (proceed: boolean) => {
		setShowConfirmation(false);
		if (proceed) {
			socket.emit("resignation", winnerName);
		}
	};

	return (
		<div>
			{!showConfirmation && (
				<button
					className="text-4xl md:text-5xl text-room-secondary font-thin hover:text-room-tertiary"
					onClick={handleButtonClick}
				>
					<LiaFlagCheckeredSolid />{" "}
				</button>
			)}
			{showConfirmation && (
				<div className="md:text-base text-sm backdrop-blur-3xl -translate-y-72 -translate-x-20 md:-translate-y-96 md:-translate-x-20 flex flex-col gap-5 bg-room-accent p-4 rounded-lg z-10 font-bold shadow-lg shadow-room-bg">
				<p>Are you sure you want to resign?</p>
					<div className="flex items-center justify-center gap-10 text-room-secondary">
						<button
							className="px-4 py-1 rounded-lg bg-amber-900"
							onClick={() => handleConfirmation(true)}
						>
							Yes
						</button>
						<button
							className="px-3 py-1 rounded-lg bg-amber-900"
							onClick={() => handleConfirmation(false)}
						>
							No
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default Resignation;
