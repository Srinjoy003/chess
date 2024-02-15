import { v4 as uuidv4 } from "uuid";
import { ChangeEvent, useEffect } from "react";
import { useRef } from "react";
import { RoomSettings } from "./page";
import { RefObject } from "react";
import { PlayerDetailsWithID } from "./page";
import { Socket } from "socket.io-client";

type PlayerSelectBoxProps = {
	options: PlayerDetailsWithID[];
	field: "whitePlayer" | "blackPlayer";
	unit?: string;
	onSelectChange: any;
	playerRef: RefObject<HTMLSelectElement>;
	roomSettings: RoomSettings;
	socket: Socket | null;
};

type TimeSelectBoxProps = {
	options: number[];
	field: "time" | "increment";
	unit?: string;
	onSelectChange: any;
	roomSettings: RoomSettings;
	socket: Socket | null;
};

export function PlayerSelectBox({
	options,
	field,
	unit,
	onSelectChange,
	playerRef,
	roomSettings,
	socket,
}: PlayerSelectBoxProps) {
	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selectedValue: string | number = event.target.value;
		console.log("Selected", selectedValue);
		onSelectChange((currentRoomSettings: RoomSettings) => {
			const updatedSettings = {
				...currentRoomSettings,
				[field]: selectedValue,
			};

			socket?.emit("roomSettings", updatedSettings);

			return updatedSettings;
		});
	};

	useEffect(() => {
		if (roomSettings[field] === "") {
			if (playerRef.current) {
				playerRef.current.selectedIndex = -1;
			}
		} else {
			if (playerRef.current) {
				const options = playerRef.current.options;
				for (let i = 0; i < options.length; i++) {
					if (options[i].value === roomSettings[field]) {
						playerRef.current.selectedIndex = i;
						break;
					}
				}
			}
		}
	}, [roomSettings, field, playerRef]);

	return (
		<div className="p-4 flex gap-20 items-center border-2 border-shad-border">
			<label htmlFor="Select" className="text-white w-20">
				{field}
			</label>
			<select
				ref={playerRef}
				id="Select"
				className="bg-black text-white p-2 rounded-md outline-none w-40 text-center"
				onChange={handleSelectChange}
			>
				<option value="" selected disabled hidden>
					Choose here
				</option>
				{options.map((option) => (
					<option key={option.playerId} value={option.playerName}>
						{option.playerName} {unit}
					</option>
				))}
			</select>
		</div>
	);
}

export function TimeSelectBox({
	options,
	field,
	unit,
	onSelectChange,
	roomSettings,
	socket,
}: TimeSelectBoxProps) {
	const playerRef = useRef<HTMLSelectElement>(null);

	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selectedValue: string | number = event.target.value;
		onSelectChange((currentRoomSettings: RoomSettings) => {
			const updatedSettings = {
				...currentRoomSettings,
				[field]: selectedValue,
			};

			socket?.emit("roomSettings", updatedSettings);

			return updatedSettings;
		});
	};

	useEffect(() => {
		if (playerRef.current) {
			const options = playerRef.current.options;
			for (let i = 0; i < options.length; i++) {
				if (options[i].value === String(roomSettings[field])) {
					playerRef.current.selectedIndex = i;
					break;
				}
			}
		}
	}, [roomSettings, field, playerRef]);

	return (
		<div className="p-4 flex gap-20 items-center border-2 border-shad-border">
			<label htmlFor="Select" className="text-white w-20">
				{field}
			</label>
			<select
				ref={playerRef}
				id="Select"
				className="bg-black text-white p-2 rounded-md outline-none w-40 text-center"
				onChange={handleSelectChange}
			>
				<option value="" selected disabled hidden>
					Choose here
				</option>
				{options.map((option) => (
					<option key={option} value={option}>
						{option} {unit}
					</option>
				))}
			</select>
		</div>
	);
}
