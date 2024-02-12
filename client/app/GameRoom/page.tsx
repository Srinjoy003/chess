"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function GameRoom() {
	const router = useRouter();
	const searchParams = useSearchParams();
	let pathname = usePathname();
	pathname = pathname.replace("GameRoom", "NameInput");
	let roomId = searchParams.get("roomId");
	let link = `http://localhost:3000${pathname}?roomId=${roomId}`;

	// useEffect(() => {
	// 	// Fetch room data or perform any other necessary setup
	// 	// Here, we're just logging the room ID and name for demonstration purposes
	// 	// console.log(searchParams.get("name")); // Access specific parameter
	// 	const newLink = searchParams.get("roomId");
	// 	if (newLink) setLink(newLink);
	// }, [searchParams]);

	return (
		<div>
			<h1>Chess Game Room</h1>
			<p>Welcome! Link: {link}</p>
			{/* Add your game content here */}
		</div>
	);
}

export default GameRoom;
