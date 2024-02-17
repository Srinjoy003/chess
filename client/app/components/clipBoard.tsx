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
		<div className="absolute left-32 text-black flex h-10 w-fit bottom-10">
			<input
				type="text"
				value="Use this Link to Invite Friends!!"
				readOnly
				className="w-72 text-center"
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
