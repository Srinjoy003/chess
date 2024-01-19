// declare var require: any;

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

type moveProps = { fromIndex: number; toIndex: number };

import { Server } from "socket.io";

const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

type Player = {
	id: string;
	color: "white" | "black";
};

const players: Player[] = [];

io.on("connection", (socket) => {
	console.log("connected with ", socket.id);
	socket.on("move", ({ fromIndex, toIndex }: moveProps) => {
		console.log("Received move:", { fromIndex, toIndex });
		socket.broadcast.emit("move", { fromIndex, toIndex });
	});

	if (players.length === 0) {
		players.push({ id: socket.id, color: "white" });
		io.to(socket.id).emit("colorAssigned", "white");
	} else if (players.length === 1) {
		players.push({ id: socket.id, color: "black" });
		io.to(socket.id).emit("colorAssigned", "black");

		// Notify both players about the colors
		io.to(players[0].id).emit("colorAssigned", "white");
		io.to(players[1].id).emit("colorAssigned", "black");
	} else {
		// Handle additional players (optional)
		io.to(socket.id).emit("colorAssigned", "spectator");
	}
});

server.listen(3001, () => {
	console.log("Server Listening on port 3001");
});
