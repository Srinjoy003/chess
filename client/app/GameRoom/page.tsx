"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { PlayerSelectBox, TimeSelectBox } from "./SelectBox";
import { v4 as uuidv4 } from "uuid";
import "./index.css";
import { Itim, Merienda } from "next/font/google";
import CopyToClipboard from "../components/clipBoard";
import Message from "./Message";
import { LuCrown } from "react-icons/lu";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ChessBoard from "../components/ChessBoard";
import { Providers } from "../reduxStore/provider";
import { current } from "@reduxjs/toolkit";

const heading = Merienda({ weight: "800", subsets: ["latin"] });
const playerFont = Merienda({ weight: "400", subsets: ["latin"] });

type moveProps = { fromIndex: number; toIndex: number; promotionMove: string };

export type PlayState = {
	serverBoardState: string[][];
	serverPrevMove: [number, number];
	serverWhiteCastling: [boolean, boolean, boolean];
	serverBlackCastling: [boolean, boolean, boolean];
	serverTurn: string;
};

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
	host: string;
	whitePlayer: string;
	blackPlayer: string;
	time: number;
	increment: number;
	gameStarted: boolean;
};

function GameRoom() {
	const [socket, setSocket] = useState<Socket>(io({ autoConnect: false }));
	const [playerList, setPlayerList] = useState<PlayerDetailsWithID[]>([]);
	const [roomId, setRoomId] = useState<string | null>(null);
	const [playerName, setPlayerName] = useState<string>("");
	const [playerId, setPlayerId] = useState<string>("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isHost, setIsHost] = useState<boolean>(false);
	const [messageIsVisible, setMessageIsVisible] = useState<boolean>(false);
	const [message, setMessage] = useState<string>("");
	const [activePlayers, setActivePlayers] = useState<{
		whitePlayer: string;
		blackPlayer: string;
	}>({ whitePlayer: "", blackPlayer: "" });

	const [moveFromIndex, setMoveFromIndex] = useState<number | null>(null); //for sockets
	const [moveToIndex, setMoveToIndex] = useState<number | null>(null);
	const [promotionMove, setPromotionMove] = useState<string | null>(null);
	const [colour, setColour] = useState<string | null>("s");
	const [playState, setPlayState] = useState<PlayState | null>(null);

	const [roomSettings, setRoomSettings] = useState<RoomSettings>({
		roomId: "",
		host: "",
		whitePlayer: "",
		blackPlayer: "",
		time: 1,
		increment: 0,
		gameStarted: false,
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

	const handleStart = () => {
		if (playerList.length < 2) {
			setMessage("Need atleast two players to start");
			setMessageIsVisible(true);
		} else if (roomSettings.whitePlayer === roomSettings.blackPlayer) {
			setMessage("Same player cannot play as white and black");
			setMessageIsVisible(true);
		} else if (roomSettings.whitePlayer === "") {
			setMessage("Please select white");
			setMessageIsVisible(true);
		} else if (roomSettings.blackPlayer === "") {
			setMessage("Please select black");
			setMessageIsVisible(true);
		} else {
			setRoomSettings((currentRoomSettings) => {
				const newRoomSettings = { ...currentRoomSettings, gameStarted: true };
				socket?.emit("roomSettings", newRoomSettings);
				return newRoomSettings;
			});
		}
	};

	useEffect(() => {
		const roomId = searchParams.get("roomId");

		if (roomId) {
			setRoomId(roomId);
		} else {
			const newRoomId = uuidv4();
			setRoomId(newRoomId);
			setRoomSettings((currentRoomSettings) => ({
				...currentRoomSettings,
				roomId: newRoomId,
			}));
		}
	}, [searchParams]);

	useEffect(() => {
		if (socket && roomId && isSubmitted && playerId === "") {
			const playerDetails: PlayerDetails = { playerName, roomId, colour: "s" };
			socket.emit("playerDetails", playerDetails);
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
		const newActivePlayers = { whitePlayer: "", blackPlayer: "" };
		for (let player of playerList) {
			if (roomSettings.whitePlayer === player.playerId) {
				newActivePlayers.whitePlayer = player.playerName;
			}

			if (roomSettings.blackPlayer === player.playerId) {
				newActivePlayers.blackPlayer = player.playerName;
			}
		}

		setActivePlayers(newActivePlayers)
	}, [roomSettings, playerList]);

	useEffect(() => {
		if (isSubmitted) {
			if (roomSettings.host === playerId && playerId !== "") {
				setIsHost(true);
			} else {
				setIsHost(false);
			}
		}
	}, [isSubmitted, playerId, roomSettings]);

	useEffect(() => {
		if (socket) {
			console.log("Listening");
			socket.on("playerList", (playerList: PlayerDetailsWithID[]) => {
				setPlayerList(playerList);
				console.log("RECIEVED PLAYERLIST", playerList);
			});

			socket.on("roomSettings", (roomSettings: RoomSettings) => {
				setRoomSettings(roomSettings);
				if (roomSettings.whitePlayer === playerId) {
					setColour("w");
					console.log("SET WHITE PLAYER");
				} else if (roomSettings.blackPlayer === playerId) {
					setColour("b");
					console.log("SET BLACK PLAYER");
				} else {
					setColour("s");
					console.log("SET SPECTATOR PLAYER");
				}
				console.log(
					"White",
					roomSettings.whitePlayer,
					"Black",
					roomSettings.blackPlayer,
					"Playerid",
					playerId
				);

				console.log("RECIEVED ROOM SETTINGS", roomSettings, playerId);
			});

			socket.on("playerJoined", (playerName: string) => {
				const newMessage = `${playerName} joined the room`;
				setMessage(newMessage);
				setMessageIsVisible(true);
			});

			socket.on("playerLeft", (playerName: string) => {
				const newMessage = `${playerName} left the room`;
				setMessage(newMessage);
				setMessageIsVisible(true);
			});

			socket.on("move", (move: moveProps) => {
				setMoveFromIndex(move.fromIndex);
				setMoveToIndex(move.toIndex);
				setPromotionMove(move.promotionMove);
				console.log(
					"RECIEVED DATA",
					move.fromIndex,
					move.toIndex,
					move.promotionMove
				);
			});

			socket.on("playState", (playState: PlayState) => {
				setPlayState(playState);
				console.log("RECIEVED PLAYSTATE", playState);
			});

			socket.on("playerId", (playerId: string) => {
				setPlayerId(playerId);
				console.log("RECIEVED PLAYERID", playerId);
			});
		}
	}, [socket, playerId]);

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
	else if (!roomSettings.gameStarted) {
		return (
			<>
				<div className="w-screen md:h-screen bg-room-bg text-white p-4 flex md:flex-row flex-col md:items-start items-center justify-start gap-32 md:gap-20">
					<div className="h-fit md:w-1/3 p-6 rounded-md mt-10 md:mt-5 lg:ml-10">
						<h1
							className={`${heading.className} text-2xl md:text-3xl lg:text-4xl text-room-tertiary font-bold`}
						>
							Room Members
						</h1>

						<div
							className={`${playerFont.className} flex-wrap flex md:flex-col gap-6 items-start mt-10 mx-3`}
						>
							{playerList.map((player) => (
								<h2
									className="text-sm sm:text-base lg:text-lg md:w-48 lg:w-56 text-room-primary bg-room-secondary py-2	px-5 sm:py-3 sm:px-8 rounded-md font-semibold flex gap-2 items-center"
									key={uuidv4()}
								>
									{player.playerName}{" "}
									{roomSettings.host === player.playerId && (
										<div className="text-red-800 text-lg sm:text-2xl">
											<LuCrown />
										</div>
									)}
								</h2>
							))}
						</div>
					</div>
					<div
						className={` ${
							isHost ? "" : "pointer-events-none"
						} h-fit w-5/6 flex flex-col mr-auto ml-auto px-10 py-5 gap-5 md:w-1/2 md:h-5/6 md:mt-auto md:mb-auto md:mr-10 md:gap-12 items-center justify-center bg-room-accent border-room-tertiary border- rounded-lg shadow-lg shadow-room-accent`}
					>
						<PlayerSelectBox
							isHost={isHost}
							name={"White Player"}
							field={"whitePlayer"}
							options={playerList}
							onSelectChange={setRoomSettings}
							playerRef={whitePlayerRef}
							roomSettings={roomSettings}
							socket={socket}
						/>
						<PlayerSelectBox
							isHost={isHost}
							name={"Black Player"}
							field={"blackPlayer"}
							options={playerList}
							onSelectChange={setRoomSettings}
							playerRef={blackPlayerRef}
							roomSettings={roomSettings}
							socket={socket}
						/>
						<TimeSelectBox
							isHost={isHost}
							name={"Time"}
							field={"time"}
							options={[1, 3, 5, 10, 15, 20, 30, 60, 120]}
							unit="min"
							onSelectChange={setRoomSettings}
							roomSettings={roomSettings}
							socket={socket}
						/>
						<TimeSelectBox
							isHost={isHost}
							name={"Increment"}
							field={"increment"}
							options={[0, 1, 2, 3, 5, 10, 20]}
							unit="sec"
							onSelectChange={setRoomSettings}
							roomSettings={roomSettings}
							socket={socket}
						/>

						<button
							onClick={handleStart}
							className="mt-6 w-16 h-8 text-base sm:w-20 sm:h-10 sm:text-lg md:w-24 md:h-12 md:text-xl lg:w-32 lg:h-14 lg:mt-10 lg:text-2xl text-room-secondary bg-room-primary hover:text-white hover:bg-amber-950 rounded-lg"
						>
							Start!
						</button>
					</div>
					<CopyToClipboard textToCopy={link} />
				</div>
				<Message
					message={message}
					messageIsVisible={messageIsVisible}
					setMessageIsVisible={setMessageIsVisible}
				/>
			</>
		);
	} else if (roomSettings.gameStarted) {
		return (
			<Providers>
				<DndProvider backend={HTML5Backend}>
					<ChessBoard
						moveFromIndex={moveFromIndex}
						moveToIndex={moveToIndex}
						promotionMove={promotionMove}
						socket={socket}
						clientTurnColour={colour}
						playState={playState}
						players={activePlayers}
					/>
				</DndProvider>
			</Providers>
		);
	}
}

export default GameRoom;
