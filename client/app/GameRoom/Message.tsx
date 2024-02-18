import React, { useState, useEffect } from "react";
import { Merienda } from "next/font/google";

const playerFont = Merienda({ weight: "400", subsets: ["latin"] });

type MessageProps = {
	message: string;
	messageIsVisible: boolean;
	setMessageIsVisible: (message: boolean) => void;
};

function Message({
	message,
	messageIsVisible,
	setMessageIsVisible,
}: MessageProps) {
	useEffect(() => {
		if (messageIsVisible) {
			const timeoutId = setTimeout(() => {
				setMessageIsVisible(false);
				console.log("TImeout ended");
			}, 3000);

			document.body.classList.add("overflow-x-hidden");

			return () => {
				clearTimeout(timeoutId);
			};
		}
	}, [setMessageIsVisible, messageIsVisible]);

	return (
		<div
			className={` ${playerFont.className} transition-transform ${
				messageIsVisible ? "translate-x-0" : "translate-x-full hidden"
			}  text-black absolute right-0 top-8 sm:top-5 rounded-xl bg-room-tertiary p-3 md:p-4 text-xs sm:text-sm md:text-base lg:text-lg`}
		>
			<div>
				<p>{message}</p>
			</div>
		</div>
	);
}

export default Message;
