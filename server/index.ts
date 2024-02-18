import { formatWithOptions } from "util";
import { CreateBoardMap } from "./chessFunctions/moves";
import { MoveValidator, PlayMove } from "./chessFunctions/moveValidator";
import { Server } from "socket.io";
import {
	PlayerDetails,
	removePlayerFromRoom,
	addPlayerToRoom,
	RoomSettings,
	updateRoomSettings,
	updateRoomSettingsOnDisconnect,
} from "./serverOperations/room";

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

type moveProps = { fromIndex: number; toIndex: number; promotionMove: string };

const playersByRoom: Record<string, PlayerDetails[]> = {};
const playerRoomMap: Record<string, string> = {};
const settingsByRoom: Record<string, RoomSettings> = {};

const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

type Player = {
	id: string;
	color: "w" | "b" | "s";
};

const players: Player[] = [];
const boardState: string[][] = CreateBoardMap();
const prevMove: [number, number] = [-1, -1];
const whiteCastling: [boolean, boolean, boolean] = [false, false, false];
const blackCastling: [boolean, boolean, boolean] = [false, false, false];
let currentTurn: string = "w";

io.on("connection", (socket) => {
	console.log("connected with ", socket.id);
	const playState = {
		serverBoardState: boardState,
		serverPrevMove: prevMove,
		serverWhiteCastling: whiteCastling,
		serverBlackCastling: blackCastling,
		serverTurn: currentTurn,
	};
	socket.emit("playState", playState);
	console.log("Sent PlayState");

	socket.on("disconnect", () => {
		console.log("disconnected: ", socket.id);
		console.log("No of players:", players.length);
		socket.removeAllListeners();

		const disconnectedPlayerIndex = players.findIndex(
			(player) => player.id === socket.id
		);

		if (disconnectedPlayerIndex !== -1) {
			players.splice(disconnectedPlayerIndex, 1);
			console.log("No of players after removal:", players.length);

			if (players.length === 2) {
				io.to(players[0].id).emit("colorAssigned", "w");
				io.to(players[1].id).emit("colorAssigned", "b");
				console.log("reassigned");
			}
		}

		const roomId = playerRoomMap[socket.id];
		const playerName = playersByRoom[roomId]?.find(
			(player) => player.playerId === socket.id
		)?.playerName;

		removePlayerFromRoom(playersByRoom, playerRoomMap, socket.id);
		updateRoomSettingsOnDisconnect(
			settingsByRoom,
			playersByRoom,
			roomId,
			socket.id
		);
		const playersInRoom = playersByRoom[roomId] ?? [];
		const roomSettings: RoomSettings = settingsByRoom[roomId];

		io.to(roomId).emit("playerList", playersInRoom);
		io.to(roomId).emit("roomSettings", roomSettings);
		io.to(roomId).emit("playerLeft", playerName);
	});

	socket.on("move", ({ fromIndex, toIndex, promotionMove }: moveProps) => {
		console.log("Received move:", { fromIndex, toIndex, promotionMove });

		if (
			MoveValidator(
				boardState,
				currentTurn,
				prevMove,
				whiteCastling,
				blackCastling,
				fromIndex,
				toIndex
			)
		) {
			PlayMove(
				boardState,
				currentTurn,
				prevMove,
				whiteCastling,
				blackCastling,
				fromIndex,
				toIndex,
				promotionMove
			);
			currentTurn = currentTurn == "w" ? "b" : "w";

			io.emit("move", { fromIndex, toIndex, promotionMove });
			// socket.broadcast.emit("move", { fromIndex, toIndex, promotionMove });
		} else {
			console.log("Invalid Move");
		}
	});

	if (players.length === 0) {
		players.push({ id: socket.id, color: "w" });
		io.to(socket.id).emit("colorAssigned", "w");
		console.log("sent white");
	} else if (players.length === 1) {
		players.push({ id: socket.id, color: "b" });
		console.log("sent black");
		io.to(socket.id).emit("colorAssigned", "b");

		// Notify both players about the colors
		// io.to(players[0].id).emit("colorAssigned", "white");
		// io.to(players[1].id).emit("colorAssigned", "black");
	} else {
		// Handle additional players (optional)
		players.push({ id: socket.id, color: "s" });
		console.log("sent spectator");
		io.to(socket.id).emit("colorAssigned", "s");
	}

	socket.on(
		"playerDetails",
		(
			{ playerName, roomId, colour }: PlayerDetails,
			setPlayerId: (playerId: string) => void
		) => {
			addPlayerToRoom(playersByRoom, playerRoomMap, socket.id, roomId, {
				playerId: socket.id,
				playerName,
				roomId,
				colour,
			});
			setPlayerId(socket.id);
			socket.join(roomId);
			console.log("Recieved Player Details", { playerName, roomId, colour });
			console.log("Player List", playersByRoom);
			console.log(" ");
			const playersInRoom = playersByRoom[roomId] ?? [];
			io.to(roomId).emit("playerList", playersInRoom);

			if (roomId in settingsByRoom) {
				socket.emit("roomSettings", settingsByRoom[roomId]);
				console.log(playerName, "is NOT Host");
			} else {
				settingsByRoom[roomId] = {
					roomId: roomId,
					host: socket.id,
					whitePlayer: "",
					blackPlayer: "",
					time: 1,
					increment: 0,
				};
				socket.emit("roomSettings", settingsByRoom[roomId]);
				console.log(playerName, "is Host");
			}

			socket.to(roomId).emit("playerJoined", playerName);
		}
	);

	socket.on("roomSettings", (roomSettings: RoomSettings) => {
		console.log("Received Room Settings:", roomSettings);
		updateRoomSettings(settingsByRoom, roomSettings.roomId, roomSettings);
		console.log("New Room Settings:", settingsByRoom);
		socket.to(roomSettings.roomId).emit("roomSettings", roomSettings);
	});
});

server.listen(3001, () => {
	console.log("Server Listening on port 3001");
});
