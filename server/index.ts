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

import {
	PlayState,
	initializePlayState,
	updatePlayStateByRoomOnDisconnect,
} from "./serverOperations/game";

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

type moveProps = { fromIndex: number; toIndex: number; promotionMove: string };

const playersByRoom: Record<string, PlayerDetails[]> = {};
const playerRoomMap: Record<string, string> = {};
const settingsByRoom: Record<string, RoomSettings> = {};
const playStateByRoom: Record<string, PlayState> = {};

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

io.on("connection", (socket) => {
	console.log("connected with ", socket.id);

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

		updatePlayStateByRoomOnDisconnect(roomId, playStateByRoom, playersByRoom);
		console.log(playStateByRoom)

		const playersInRoom = playersByRoom[roomId] ?? [];
		const roomSettings: RoomSettings = settingsByRoom[roomId];

		io.to(roomId).emit("playerList", playersInRoom);
		io.to(roomId).emit("roomSettings", roomSettings);
		io.to(roomId).emit("playerLeft", playerName);
	});

	socket.on("move", ({ fromIndex, toIndex, promotionMove }: moveProps) => {
		console.log("Received move:", { fromIndex, toIndex, promotionMove });
		const roomId = playerRoomMap[socket.id];

		if (
			MoveValidator(
				playStateByRoom[roomId].serverBoardState,
				playStateByRoom[roomId].serverTurn,
				playStateByRoom[roomId].serverPrevMove,
				playStateByRoom[roomId].serverWhiteCastling,
				playStateByRoom[roomId].serverBlackCastling,
				fromIndex,
				toIndex
			)
		) {
			PlayMove(
				playStateByRoom[roomId].serverBoardState,
				playStateByRoom[roomId].serverTurn,
				playStateByRoom[roomId].serverPrevMove,
				playStateByRoom[roomId].serverWhiteCastling,
				playStateByRoom[roomId].serverBlackCastling,
				fromIndex,
				toIndex,
				promotionMove
			);
			// currentTurn = currentTurn == "w" ? "b" : "w";
			playStateByRoom[roomId].serverTurn =
				playStateByRoom[roomId].serverTurn == "w" ? "b" : "w";

			io.to(roomId).emit("move", { fromIndex, toIndex, promotionMove });
		} else {
			console.log("Invalid Move");
		}
	});

	socket.on(
		"playerDetails",
		({ playerName, roomId, colour }: PlayerDetails) => {
			addPlayerToRoom(playersByRoom, playerRoomMap, socket.id, roomId, {
				playerId: socket.id,
				playerName,
				roomId,
				colour,
			});
			socket.emit("playerId", socket.id);
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
					gameStarted: false,
				};
				socket.emit("roomSettings", settingsByRoom[roomId]);
				console.log(playerName, "is Host");
			}

			if (roomId in playStateByRoom) {
				socket.emit("playState", playStateByRoom[roomId]);
			} else {
				initializePlayState(roomId, playStateByRoom);
			}

			socket.to(roomId).emit("playerJoined", playerName);
		}
	);

	socket.on("roomSettings", (roomSettings: RoomSettings) => {
		console.log("Received Room Settings:", roomSettings);
		updateRoomSettings(settingsByRoom, roomSettings.roomId, roomSettings);
		console.log("New Room Settings:", settingsByRoom);
		io.to(roomSettings.roomId).emit("roomSettings", roomSettings);
	});
});

server.listen(3001, () => {
	console.log("Server Listening on port 3001");
});
