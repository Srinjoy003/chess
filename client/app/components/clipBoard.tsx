import React, { useState } from "react";
import copy from "clipboard-copy";

type clipBoardProps = { textToCopy: string };

function CopyToClipboard({ textToCopy }: clipBoardProps) {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopyClick = async () => {
		try {
			await copy(textToCopy);
			setIsCopied(true);
		} catch (error) {
			console.error("Failed to copy to clipboard", error);
		}
	};

	return (
		<div className="md:absolute md:left-10 lg:left-20 text-black flex h-8 sm:h-10 w-fit md:bottom-10 text-xs sm:text-sm lg:text-base">
			<input
				type="text"
				value="Use this Link to Invite Friends!!"
				readOnly
				className="w-48 sm:w-56 lg:w-72 text-center"
			/>
			<button
				onClick={handleCopyClick}
				disabled={isCopied}
				className={`bg-room-tertiary p-2 transition-all duration-300 ease-in-out hover:bg-room-secondary`}
			>
				{isCopied ? "Copied!" : "Copy"}
			</button>
		</div>
	);
}

export default CopyToClipboard;
