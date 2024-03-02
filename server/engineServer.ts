import { Server } from "socket.io";
import { MakeEngineMove } from "./chessEngine/core/aiMain";

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	console.log("connected with ", socket.id);

	socket.on(
		"aiMove",
		({
			boardState,
			aiTurn,
			prevMove,
			whiteCastling,
			blackCastling,
			timeLimit,
			moveList,
		}) => {
            const result = MakeEngineMove(boardState, aiTurn, prevMove, whiteCastling, blackCastling, timeLimit, moveList); 
            socket.emit('aiMove', result)
		}
	);
});

server.listen(3002, () => {
	console.log("Server Listening on port 3002");
});
