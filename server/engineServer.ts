import { Server } from "socket.io";
import { MakeEngineMove } from "./chessEngine/core/aiMain";
import express from "express";
import http from "http";

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
		async({
			boardState,
			aiTurn,
			prevMove,
			whiteCastling,
			blackCastling,
			timeLimit,
			moveList,
		}) => {
            const result = await MakeEngineMove(boardState, aiTurn, prevMove, whiteCastling, blackCastling, timeLimit, moveList); 
            socket.emit('aiMove', result)
		}
	);
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
	console.log(`Server Listening on port ${port}`);
});
