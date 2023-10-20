"use client";

import { useDrag } from "react-dnd";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import { BlackBishop, WhiteBishop } from "../pieceSvg/Bishop";
import { BlackKnight, WhiteKnight } from "../pieceSvg/Knight";
import { BlackPawn, WhitePawn } from "../pieceSvg/Pawn";
import { BlackRook, WhiteRook } from "../pieceSvg/Rook";
import { BlackKing, WhiteKing } from "../pieceSvg/King";
import { BlackQueen, WhiteQueen } from "../pieceSvg/Queen";

type ChessPieceProps = {
	piece: string;
	position: number;
	pawnPromotionOpen: boolean;
};

const ChessPiece = ({
	piece,
	position,
	pawnPromotionOpen,
}: ChessPieceProps) => {
	const turn = useSelector((state: RootState) => state.turn);

	const [{ isDragging }, dragRef] = useDrag({
		type: "CHESS_PIECE",
		item: { piece, position },
		canDrag: piece[0] === turn && !pawnPromotionOpen,
		collect: (monitor) => ({
			isDragging: !!monitor.isDragging(),
		}),
	});

	const size = 80;

	return (
		<div
			className="z-10 flex flex-row items-center justify-center"
			ref={dragRef}
			style={{
				opacity: isDragging ? 0 : 1, // Reduce opacity when dragging
			}}
		>
			{piece[1] === "P" && piece[0] === "b" && <BlackPawn size={size} />}
			{piece[1] === "Q" && piece[0] === "b" && <BlackQueen size={size} />}
			{piece[1] === "H" && piece[0] === "b" && <BlackKnight size={size} />}
			{piece[1] === "B" && piece[0] === "b" && <BlackBishop size={size} />}
			{piece[1] === "K" && piece[0] === "b" && <BlackKing size={size} />}
			{piece[1] === "R" && piece[0] === "b" && <BlackRook size={size} />}

			{piece[1] === "P" && piece[0] === "w" && <WhitePawn size={size} />}
			{piece[1] === "Q" && piece[0] === "w" && <WhiteQueen size={size} />}
			{piece[1] === "H" && piece[0] === "w" && <WhiteKnight size={size} />}
			{piece[1] === "B" && piece[0] === "w" && <WhiteBishop size={size} />}
			{piece[1] === "K" && piece[0] === "w" && <WhiteKing size={size} />}
			{piece[1] === "R" && piece[0] === "w" && <WhiteRook size={size} />}
		</div>
	);
};

export default ChessPiece;
