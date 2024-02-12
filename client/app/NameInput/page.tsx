"use client";

import React from "react";
import "./index.css";
import { Bebas_Neue, Source_Code_Pro } from "next/font/google";
import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const BebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"] });

function NameInput() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [name, setName] = useState("");
	const [roomId, setRoomId] = useState<string | null>(null);

	useEffect(() => {
		// Fetch room data or perform any other necessary setup
		// Here, we're just logging the room ID and name for demonstration purposes
		// console.log(searchParams.get("name")); // Access specific parameter
		const newRoomId = searchParams.get("roomId");
		if (newRoomId) setRoomId(newRoomId);
	}, [searchParams]);

	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (roomId) {
			router.push(`/GameRoom?roomId=${roomId}`);

		}
		else{
			const newRoomId = uuidv4()
			router.push(`/GameRoom?roomId=${newRoomId}`);

		}

	};

	return (
		<div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-10">
			<div>
				<div className="inputbox">
					<input
						required
						type="text"
						value={name}
						onChange={(e: ChangeEvent<HTMLInputElement>) =>
							setName(e.target.value)
						}
					/>
					<span>Enter your Name</span>
					<i></i>
				</div>
			</div>

			<button
				onClick={handleSubmit}
				className="h-10 w-32 sm:w-36 text-zinc-700 hover:text-zinc-200 backdrop-blur-lg bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)] to-transparent rounded-md py-2 px-6 shadow hover:shadow-zinc-400 duration-700"
			>
				Submit
			</button>
		</div>
	);
}

export default NameInput;
