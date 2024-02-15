export type PlayerDetails = {
	playerId: string;
	playerName: string;
	roomId: string;
	colour: "w" | "b" | "s";
};

export type RoomSettings = {
	whitePlayer: string;
	blackPlayer: string;
	time: number;
	increment: number;
};
export function removePlayerFromRoom(
	playersByRoom: Record<string, PlayerDetails[]>,
	playerRoomMap: Record<string, string>,
	playerId: string
): void {
	const roomId = playerRoomMap[playerId];
	delete playerRoomMap[playerId];
	if (playersByRoom[roomId]) {
		// Filter out the player with the specified playerId
		playersByRoom[roomId] = playersByRoom[roomId].filter(
			(player) => player.playerId !== playerId
		);

		// If there are no players left in the room, you may want to remove the room key
		if (playersByRoom[roomId].length === 0) {
			delete playersByRoom[roomId];
		}
	}
}

export function addPlayerToRoom(
	playersByRoom: Record<string, PlayerDetails[]>,
	playerRoomMap: Record<string, string>,
	playerId: string,
	roomId: string,
	player: PlayerDetails
) {
	playerRoomMap[playerId] = roomId;

	if (!playersByRoom[roomId]) {
		playersByRoom[roomId] = [];
	}

	playersByRoom[roomId].push(player);
}

export function updateRoomSettings(
	settingsByRoom: Record<string, RoomSettings>,
	roomId: string,
	roomSettings: RoomSettings
) {
	settingsByRoom[roomId] =  roomSettings
}
