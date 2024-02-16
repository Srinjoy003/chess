"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { PlayerSelectBox, TimeSelectBox } from "./SelectBox";
import { v4 as uuidv4 } from "uuid";
import "./index.css";
import { Itim, Merienda } from "next/font/google";

const heading = Merienda({ weight: "800", subsets: ["latin"] });
const playerFont = Merienda({ weight: "400", subsets: ["latin"] });

type PlayerDetails = {
	playerName: string;
	roomId: string;
	colour: "w" | "b" | "s";
};

export type PlayerDetailsWithID = {
	playerId: string;
	playerName: string;
	roomId: string;
	colour: "w" | "b" | "s";
};

export type RoomSettings = {
	roomId: string;
	whitePlayer: string;
	blackPlayer: string;
	time: number;
	increment: number;
};

function GameRoom() {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [playerList, setPlayerList] = useState<PlayerDetailsWithID[]>([]);
	const [roomId, setRoomId] = useState<string | null>(null);
	const [playerName, setPlayerName] = useState<string>("");
	const [playerId, setPlayerId] = useState<string>("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isHost, setIsHost] = useState<boolean>(false);
	const [roomSettings, setRoomSettings] = useState<RoomSettings>({
		roomId: "",
		whitePlayer: "",
		blackPlayer: "",
		time: 1,
		increment: 0,
	});

	const whitePlayerRef = useRef<HTMLSelectElement>(null);
	const blackPlayerRef = useRef<HTMLSelectElement>(null);
	const playerListExample = [
		"Zen",
		"Beastmode",
		"Vatira",
		"ApparentlyJack",
		"FirstKiller",
	];

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
			const newRoomId = uuidv4();
			setRoomId(newRoomId);
			setIsHost(true);
			setRoomSettings((currentRoomSettings) => ({
				...currentRoomSettings,
				roomId: newRoomId,
			}));
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

			socket.on("roomSettings", (roomSettings: RoomSettings) => {
				setRoomSettings(roomSettings);
				console.log("RECIEVED ROOM SETTINGS", roomSettings);
			});
		}
	}, [socket]);

	let link = `http://localhost:3000${pathname}?roomId=${roomId}`;

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
						<span className="">Enter your Name</span>
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
			<div className="w-screen h-screen bg-room-bg  text-white p-4 flex gap-20">
				<div className="w-1/3 p-6 rounded-md mt-10 ml-10">
					<h1
						className={`${heading.className} md:text-3xl lg:text-4xl text-room-tertiary font-bold`}
					>
						Room Members
					</h1>
					{/* <h1 className="text-4xl text-shad-white font-bold">Link: {link}</h1> */}

					<div
						className={`${playerFont.className} flex flex-col gap-5 items-start mt-10 mx-3`}
					>
						{/* {playerList.map((player) => (
							<h2
								className="md:text-base lg:text-lg md:w-48 lg:w-56 text-room-primary bg-room-secondary  py-3 px-8 rounded-md font-semibold"
								key={uuidv4()}
							>
								{player.playerName}
							</h2>
						))} */}

						{playerListExample.map((player) => (
							<h2
								className="md:text-base lg:text-lg md:w-48 lg:w-56 text-room-primary bg-room-secondary  py-3 px-8 rounded-md font-semibold"
								key={uuidv4()}
							>
								{player}
							</h2>
						))}
					</div>
				</div>
				<div className="w-1/2 h-5/6 md:mt-auto md:mb-auto mr-10 px-10 gap-9 flex flex-col items-center justify-center bg-room-accent border-room-tertiary border- rounded-lg shadow-lg shadow-room-accent">
					<PlayerSelectBox
						name={"White Player"}
						field={"whitePlayer"}
						options={playerList}
						onSelectChange={setRoomSettings}
						playerRef={whitePlayerRef}
						roomSettings={roomSettings}
						socket={socket}
					/>
					<PlayerSelectBox
						name={"Black Player"}
						field={"blackPlayer"}
						options={playerList}
						onSelectChange={setRoomSettings}
						playerRef={blackPlayerRef}
						roomSettings={roomSettings}
						socket={socket}
					/>
					<TimeSelectBox
						name={"Time"}
						field={"time"}
						options={[1, 3, 5, 10, 15, 20, 30, 60, 120]}
						unit="min"
						onSelectChange={setRoomSettings}
						roomSettings={roomSettings}
						socket={socket}
					/>
					<TimeSelectBox
						name={"Increment"}
						field={"increment"}
						options={[0, 1, 2, 3, 5, 10, 20]}
						unit="sec"
						onSelectChange={setRoomSettings}
						roomSettings={roomSettings}
						socket={socket}
					/>

					<button className="w-32 h-14 text-2xl text-room-secondary bg-room-primary hover:text-white hover:bg-amber-950 rounded-lg mt-10">
						Start!
					</button>
				</div>
			</div>
		);
	}
}

export default GameRoom;
