import { v4 as uuidv4 } from "uuid";
import { ChangeEvent } from "react";
import { SetStateAction, Dispatch } from "react";
import { RoomSettings } from "./page";

type SelectBoxProps = {
	options: (string | number)[];
	field: string;
	unit?: string;
	onSelectChange: any;
};

export default function SelectBox({
	options,
	field,
	unit,
	onSelectChange,
}: SelectBoxProps) {
	const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
		const selectedValue: string | number = event.target.value;
		onSelectChange((currentRoomSettings: RoomSettings) => ({
			...currentRoomSettings,
			[field]: selectedValue,
		}));
	};
	return (
		<div className="p-4 flex gap-20 items-center border-2 border-shad-border">
			<label htmlFor="Select" className="text-white w-20">
				{field}
			</label>
			<select
				id="Select"
				className="bg-black text-white p-2 rounded-md outline-none w-40 text-center"
				onChange={handleSelectChange}
			>
				{options.map((option) => (
					<option key={option} value={option}>
						{option} {unit}
					</option>
				))}
			</select>
		</div>
	);
}
