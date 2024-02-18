import { ChangeEvent, useEffect } from "react";
import { useRef } from "react";
import { RoomSettings } from "./page";
import { RefObject } from "react";
import { PlayerDetailsWithID } from "./page";
import { Socket } from "socket.io-client";
import { Itim, Merienda } from "next/font/google";

const labelFont = Merienda({ weight: "700", subsets: ["latin"] });
const selectFont = Merienda({ weight: "500", subsets: ["latin"] });

const divClass = ` md:p-2 lg:px-4 flex gap-8 md:gap-5 lg:gap-28 items-center w-full justify-start`;
const labelClass = `${labelFont.className} text-room-primary w-1/2 sm::w-96 text-sm sm:text-base md:text-xl lg:text-2xl`;
const selectClass = `${selectFont.className} bg-room-secondary text-room-primary py-2 sm:py-3 rounded-md outline-none w-40 text-xs sm:w-48 sm:text-sm md:w-56 md:text-base lg:w-80 lg:text-lg text-center`;

type PlayerSelectBoxProps = {
	name: string;
	options: PlayerDetailsWithID[];
	field: "whitePlayer" | "blackPlayer";
	unit?: string;
	onSelectChange: any;
	playerRef: RefObject<HTMLSelectElement>;
	roomSettings: RoomSettings;
	socket: Socket | null;
	isHost: boolean;
};

type TimeSelectBoxProps = {
	name: string;
	options: number[];
	field: "time" | "increment";
	unit?: string;
	onSelectChange: any;
	roomSettings: RoomSettings;
	socket: Socket | null;
	isHost: boolean;
};

export function PlayerSelectBox({
	name,
	options,
	field,
	unit,
	onSelectChange,
	playerRef,
	roomSettings,
	socket,
	isHost,
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
		if (roomSettings) {
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
		}
	}, [roomSettings, field, playerRef]);

	return (
		<div className={divClass}>
			<label htmlFor="Select" className={labelClass}>
				{name}
			</label>
			<select
				ref={playerRef}
				id="Select"
				className={selectClass + ` ${isHost ? "" : "opacity-70"}`}
				onChange={handleSelectChange}
			>
				{!playerRef.current?.value && <option value="" hidden></option>}

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
	name,
	options,
	field,
	unit,
	onSelectChange,
	roomSettings,
	socket,
	isHost,
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
		if (playerRef.current && roomSettings) {
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
		<div className={divClass}>
			<label htmlFor="Select" className={labelClass}>
				{name}
			</label>
			<select
				ref={playerRef}
				id="Select"
				className={selectClass + ` ${isHost ? "" : "opacity-70"}`}
				onChange={handleSelectChange}
			>
				<option value="" selected disabled hidden>
					Choose here
				</option>
				{options.map((option) => (
					<option key={option} value={option} className="hover:bg-room-primary">
						{option} {unit}
					</option>
				))}
			</select>
		</div>
	);
}
