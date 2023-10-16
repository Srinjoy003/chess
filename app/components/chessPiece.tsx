'use client'

import { useDrag } from "react-dnd";
import {
	FaChessBishop,
	FaChessKing,
	FaChessKnight,
	FaChessPawn,
	FaChessQueen,
	FaChessRook,
} from "react-icons/fa";

type ChessPieceProps = { piece: string; type: string; position: number};

const ChessPiece = ({ piece, type, position}: ChessPieceProps) => {
	const [, ref] = useDrag({
		type,
		item: { piece, position },
	});

    

	return (
		<div
        className="text-5xl z-10"
			ref={ref}
			
		>
			{piece == "P" && <FaChessPawn />}
			{piece == "R" && <FaChessRook />}
			{piece == "K" && <FaChessKing />}
			{piece == "H" && <FaChessKnight />}
			{piece == "Q" && <FaChessQueen />}
			{piece == "B" && <FaChessBishop />}
		</div>
	);
};

export default ChessPiece;
