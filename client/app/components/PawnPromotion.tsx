import { BlackRook, WhiteRook } from "../assets/pieceSvg/Rook";
import { BlackQueen, WhiteQueen } from "../assets/pieceSvg/Queen";
import { BlackBishop, WhiteBishop } from "../assets/pieceSvg/Bishop";
import { BlackKnight, WhiteKnight } from "../assets/pieceSvg/Knight";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";

type PawnPromotionProps = {
	open: boolean;
	handleSelect: (piece: string, ai:boolean) => void;
};

function PawnPromotion({ open, handleSelect }: PawnPromotionProps) {
	const size = "w-10 h-10 md:w-20 md:h-20";
	const turn = useSelector((state: RootState) => state.turn);

	return (
		<div
			className={`flex flex-col items-center justify-center w-24 gap-3 rounded-xl shadow-2xl h-96 bg-white ${
				open ? "" : "hidden"
			}`}
		>
			<div onClick={() => handleSelect(turn + "Q", false)}>
				{turn === "w" ? <WhiteQueen size={size} /> : <BlackQueen size={size} />}
			</div>
			<div onClick={() => handleSelect(turn + "R", false)}>
				{turn === "w" ? <WhiteRook size={size} /> : <BlackRook size={size} />}
			</div>
			<div onClick={() => handleSelect(turn + "B", false)}>
				{turn === "w" ? (
					<WhiteBishop size={size} />
				) : (
					<BlackBishop size={size} />
				)}
			</div>
			<div onClick={() => handleSelect(turn + "K", false)}>
				{turn === "w" ? (
					<WhiteKnight size={size} />
				) : (
					<BlackKnight size={size} />
				)}
			</div>
		</div>
	);
}

export default PawnPromotion;
