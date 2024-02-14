import { v4 as uuidv4 } from "uuid";

type SelectBoxProps = { options: string[]; field: string };

export default function SelectBox({ options, field }: SelectBoxProps) {
	return (
		<div className="p-4 flex gap-20 items-center border-2 border-shad-border">
			<label htmlFor="Select" className="text-white">
				{field}
			</label>
			<select
				id="Select"
				className="bg-black text-white p-2 rounded-md outline-none w-40"
			>
				{options.map((option) => (
					<option key={uuidv4()} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}
