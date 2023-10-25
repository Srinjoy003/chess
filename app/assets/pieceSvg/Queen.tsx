import { ChessPieceProp } from "./ChessPieceProps";

export function BlackQueen({ size }: ChessPieceProp) {
	return (
		<svg
			className={size}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 45 45"
		>
			<g
				fillRule="evenodd"
				stroke="#000"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			>
				<g stroke="none">
					<circle cx="6" cy="12" r="2.75"></circle>
					<circle cx="14" cy="9" r="2.75"></circle>
					<circle cx="22.5" cy="8" r="2.75"></circle>
					<circle cx="31" cy="9" r="2.75"></circle>
					<circle cx="39" cy="12" r="2.75"></circle>
				</g>
				<path
					strokeLinecap="butt"
					d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5 9 26z"
				></path>
				<path
					strokeLinecap="butt"
					d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
				></path>
				<path
					fill="none"
					strokeLinecap="butt"
					d="M11 38.5a35 35 1 0023 0"
				></path>
				<path
					fill="none"
					stroke="#ececec"
					d="M11 29a35 35 1 0123 0m-21.5 2.5h20m-21 3a35 35 1 0022 0m-23 3a35 35 1 0024 0"
				></path>
			</g>
		</svg>
	);
}

export function WhiteQueen({ size }: ChessPieceProp) {
	return (
		<svg
			className={size}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 45 45"
		>
			<g
				fill="#fff"
				fillRule="evenodd"
				stroke="#000"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="1.5"
			>
				<path d="M8 12a2 2 0 11-4 0 2 2 0 114 0zm16.5-4.5a2 2 0 11-4 0 2 2 0 114 0zM41 12a2 2 0 11-4 0 2 2 0 114 0zM16 8.5a2 2 0 11-4 0 2 2 0 114 0zM33 9a2 2 0 11-4 0 2 2 0 114 0z"></path>
				<path
					strokeLinecap="butt"
					d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14l2 12z"
				></path>
				<path
					strokeLinecap="butt"
					d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"
				></path>
				<path
					fill="none"
					d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"
				></path>
			</g>
		</svg>
	);
}
