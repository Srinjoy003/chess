"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import SelectBox from "./SelectBox";
import { v4 as uuidv4 } from "uuid";
import "./index.css";

type PlayerDetails = {
	playerName: string;
	roomId: string;
	colour: "w" | "b" | "s";
};

type PlayerDetailsWithID = {
	playerId: string;
	playerName: string;
	roomId: string;
	colour: "w" | "b" | "s";
};

function GameRoom() {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [playerList, setPlayerList] = useState<PlayerDetailsWithID[]>([]);
	const [roomId, setRoomId] = useState<string | null>(null);
	const [playerName, setPlayerName] = useState<string>("");
	const [playerId, setPlayerId] = useState<string>("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isHost, setIsHost] = useState(false);

	const searchParams = useSearchParams();
	let pathname = usePathname();

	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (playerName === "") return;
		setIsSubmitted(true);
	};

	useEffect(() => {
		const roomId = searchParams.get("roomId");

		if (roomId) {
			setRoomId(roomId);
		} else {
			setRoomId(uuidv4());
			setIsHost(true);
		}
	}, [searchParams]);

	useEffect(() => {
		if (socket && roomId && isSubmitted && playerId === "") {
			const playerDetails: PlayerDetails = { playerName, roomId, colour: "s" };
			socket.emit("playerDetails", playerDetails, setPlayerId);
			console.log("Sent Player Details");
		}
	}, [roomId, playerName, socket, isSubmitted, playerId]);

	useEffect(() => {
		if (isSubmitted) {
			const socket = io("http://localhost:3001", { reconnection: false });
			setSocket(socket);

			return () => {
				socket.disconnect();
			};
		}
	}, [isSubmitted]);

	useEffect(() => {
		if (socket) {
			console.log("Listening");
			socket.on("playerList", (playerList: PlayerDetailsWithID[]) => {
				setPlayerList(playerList);
				console.log("RECIEVED PLAYERLIST", playerList);
			});
		}
	}, [socket]);

	let link = `http://localhost:3000${pathname}?roomId=${roomId}`;

	const field = "White";
	const options = ["Asteraxx", "Zen", "FK", "Vatira", "Beastmode"];

	if (!isSubmitted)
		return (
			<main className="w-screen h-screen bg-dark-background flex flex-col items-center justify-center gap-10">
				<div>
					<div className="inputbox">
						<input
							required
							type="text"
							value={playerName}
							onChange={(e) => setPlayerName(e.target.value)}
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
			</main>
		);
	else {
		return (
			<div className="w-screen h-screen bg-shad-dark text-white p-4 flex ">
				{/* <h1>Chess Game Room</h1>
	<p>Welcome! Link: {link}</p> */}
				<div className="w-1/2 border-2 border-shad-border p-6 rounded-md">
					<h1 className="text-4xl text-shad-white font-bold">Room Members</h1>
					<h1 className="text-4xl text-shad-white font-bold">Link: {link}</h1>

					<div className="flex flex-col gap-5 items-start mt-10 mx-3">
						{playerList.map((player) => (
							<h2 className="text-lg font-medium" key={uuidv4()}>
								{player.playerName}
							</h2>
						))}
					</div>
				</div>
				<div className="w-1/2">
					<SelectBox field={field} options={options} />
				</div>
			</div>
		);
	}
}

export default GameRoom;
