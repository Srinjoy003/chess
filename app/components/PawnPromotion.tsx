import { BlackRook, WhiteRook } from "../pieceSvg/Rook";
import { BlackQueen, WhiteQueen } from "../pieceSvg/Queen";
import { BlackBishop, WhiteBishop } from "../pieceSvg/Bishop";
import { BlackKnight, WhiteKnight } from "../pieceSvg/Knight";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";

type PawnPromotionProps = {
	open: boolean;
	handleSelect: (piece: string) => void;
};

function PawnPromotion({ open, handleSelect }: PawnPromotionProps) {
	const size = 80;
	const turn = useSelector((state: RootState) => state.turn);

	const promotionTurn = turn === "w" ? "b" : "w";

	return (
		//opposite as turn is switched until choice is made
		<div
			className={`flex flex-col items-center justify-center w-24 gap-3 rounded-xl shadow-2xl h-96 ${
				open ? "" : "hidden"
			} ${turn === "w" ? "bg-white" : "bg-white"}`}
		>
			<div onClick={() => handleSelect(promotionTurn + "Q")}>
				{turn === "b" ? <WhiteQueen size={size} /> : <BlackQueen size={size} />}
			</div>
			<div onClick={() => handleSelect(promotionTurn + "R")}>
				{turn === "b" ? <WhiteRook size={size} /> : <BlackRook size={size} />}
			</div>
			<div onClick={() => handleSelect(promotionTurn + "B")}>
				{turn === "b" ? (
					<WhiteBishop size={size} />
				) : (
					<BlackBishop size={size} />
				)}
			</div>
			<div onClick={() => handleSelect(promotionTurn + "K")}>
				{turn === "b" ? (
					<WhiteKnight size={size} />
				) : (
					<BlackKnight size={size} />
				)}
			</div>
		</div>
	);
}

export default PawnPromotion;
