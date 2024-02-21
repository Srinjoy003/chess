import { v4 as uuidv4 } from "uuid";
import Square from "./Square";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../reduxStore/store";
import {
	InCheck,
	CheckMate,
	EnPassantMoveList,
	CastlingMoveList,
	StaleMate,
	InsufficientMaterial,
	ThreeFoldRepetition,
	MoveList,
	CaptureMoveList,
} from "../helperFunctions";
import PawnPromotion from "./PawnPromotion";
import Timer from "./Timer";
import { useDispatch } from "react-redux";
import { toggleTurn } from "../reduxStore/turnSlice";

import { Socket } from "socket.io-client";
import { TranspositionTable } from "../chessEngine/core/aiSearch";
import { moveToUCI } from "../chessEngine/openings/openingParser";
import { MakeEngineMove } from "../chessEngine/core/aiMain";
import {
	MoveMaker,
	deepCopyBoard,
	deepCopyCastling,
} from "../chessEngine/core/MoveGenerator";
import { PlayState } from "../page";
import { FaChessRook } from "react-icons/fa6";
import Image from "next/image";
import { Merienda } from "next/font/google";

const playerFont = Merienda({ weight: "900", subsets: ["latin"] });

type moveProps = {
	moveFromIndex: number | null;
	moveToIndex: number | null;
	promotionMove: string | null;
	socket: Socket;
	clientTurnColour: string | null;
	playState: PlayState | null;
};

export function CreateBoardMap() {
	const board = [];

	for (let i = 0; i <= 7; i++) {
		let row = [];
		for (let j = 0; j <= 7; j++) {
			let piece = "";
			let colour = "";

			if (i == 1 || i == 6) piece = "P";
			else if (i == 0 || i == 7) {
				if (j == 0 || j == 7) piece = "R";
				else if (j == 1 || j == 6) piece = "H";
				else if (j == 2 || j == 5) piece = "B";
				else if (j == 3) piece = "Q";
				else if (j == 4) piece = "K";
			} else piece = "-";

			if (i < 2) colour = "w";
			else if (i > 5) colour = "b";

			row.push(colour + piece);
		}

		board.push(row);
	}

	return board;
}

export default function ChessBoard({
	moveFromIndex,
	moveToIndex,
	promotionMove,
	socket,
	clientTurnColour,
	playState,
}: moveProps) {
	type positionType = [string, string[][]];
	const boardMap = CreateBoardMap();
	const [boardState, setBoardState] = useState(Array.from(boardMap));

	const [selectedPiece, setSelectedPiece] = useState<[number, string] | null>(
		null
	);

	const [prevMove, setPrevMove] = useState<[number, number] | null>([-1, -1]);
	const [whiteCastling, setWhiteCastling] = useState<
		[boolean, boolean, boolean]
	>([false, false, false]);
	const [blackCastling, setBlackCastling] = useState<
		[boolean, boolean, boolean]
	>([false, false, false]);
	const [pawnPromotionOpen, setpawnPromotionOpen] = useState(false);
	const [promotionInfo, setPromotionInfo] = useState<
		[number, number, string] | null
	>(null);
	const [promotedPiecePosition, setPromotedPiecePosition] = useState<
		[number, number] | null
	>(null);

	const [isTimeUp, setIsTimeUp] = useState(false);
	const [playTime, setplayTime] = useState(10);

	const turn = useSelector((state: RootState) => state.turn);
	const dispatch = useDispatch();

	const [position, setPosition] = useState<positionType>([turn, boardState]);
	const [positionList, setPositionList] = useState<positionType[]>([
		[turn, boardState],
	]);

	const [moveList, setMoveList] = useState<string[]>([]);

	const [sound, setSound] = useState<
		"move" | "capture" | "check" | "promote" | "end"
	>("move");

	const noOfMoves = useRef(0);

	const moveSound = useRef<HTMLAudioElement | null>(null);
	const checkSound = useRef<HTMLAudioElement | null>(null);
	const captureSound = useRef<HTMLAudioElement | null>(null);
	const promoteSound = useRef<HTMLAudioElement | null>(null);
	const endSound = useRef<HTMLAudioElement | null>(null);

	const inCheck = InCheck(turn, boardState);

	const isCheckMate = CheckMate(
		turn,
		boardState,
		prevMove,
		whiteCastling,
		blackCastling
	);

	const isStaleMate = StaleMate(
		boardState,
		turn,
		prevMove,
		whiteCastling,
		blackCastling
	);

	const hasInsufficientMaterial = InsufficientMaterial(boardState);

	const isThreeFoldRepetion = ThreeFoldRepetition(positionList, position);

	const victoryOrLoss = isCheckMate || isTimeUp;
	const draw = isStaleMate || hasInsufficientMaterial || isThreeFoldRepetion;
	const gameEnded = victoryOrLoss || draw;

	useEffect(() => {
		setPosition([turn, boardState]);
	}, [turn, boardState]); //could be problematic for multiplayer

	useEffect(() => {
		if (positionList.length === noOfMoves.current) {
			positionList.push(position);
		}
	}, [position, positionList, noOfMoves]);

	const playSound = (audio: HTMLAudioElement | null) => {
		if (audio) {
			audio?.play().catch((error) => {
				console.error("Audio playback error:", error);
			});
		}
	};

	useEffect(() => {
		if (inCheck) setSound("check");
		if (gameEnded) setSound("end");
		if (sound === "move") playSound(moveSound.current);
		else if (sound === "capture") playSound(captureSound.current);
		else if (sound === "check") playSound(checkSound.current);
		else if (sound === "promote") playSound(promoteSound.current);
		else if (sound === "end") playSound(endSound.current);
	}, [boardState, inCheck, sound, gameEnded]);

	const handlePromotion = useCallback(
		(piece: string) => {
			setpawnPromotionOpen(false);
			setSound("promote");
			if (promotedPiecePosition) {
				socket.emit("move", {
					fromIndex: promotedPiecePosition[0],
					toIndex: promotedPiecePosition[1],
					promotionMove: piece[1],
				});
			}
		},
		[promotedPiecePosition, socket]
	);

	useEffect(() => {
		if (
			moveFromIndex !== null &&
			moveToIndex !== null &&
			promotionMove != null
		) {
			const i1 = Math.floor(moveFromIndex / 10);
			const j1 = moveFromIndex % 10;

			const i2 = Math.floor(moveToIndex / 10);
			const j2 = moveToIndex % 10;

			const piece = boardState[i1][j1];
			const boardStateMul = deepCopyBoard(boardState);
			const whiteCastlingMul = deepCopyCastling(whiteCastling);
			const blackCastlingMul = deepCopyCastling(blackCastling);
			const capturedPiece = boardState[i2][j2];
			const isCastling =
				piece !== "-" && piece[1] === "K" && Math.abs(j1 - j2) > 1
					? true
					: false;

			const isEnpassant =
				piece !== "-" &&
				piece[1] === "P" &&
				j1 !== j2 &&
				boardState[i2][j2] === "-";

			const isPromotion =
				piece[1] == "P" &&
				((piece[0] == "w" && i2 == 7) || (piece[0] == "b" && i2 == 0));
			const promotedPiece = promotionMove;

			if (capturedPiece !== "-") {
				setSound("capture");
			} else {
				setSound("move");
			}

			MoveMaker(
				boardStateMul,
				moveFromIndex,
				moveToIndex,
				promotedPiece,
				isPromotion,
				isCastling,
				isEnpassant,
				whiteCastlingMul,
				blackCastlingMul
			);
			setBoardState(boardStateMul);
			setBlackCastling(blackCastlingMul);
			setWhiteCastling(whiteCastlingMul);
			setPrevMove([moveFromIndex, moveToIndex]);
			dispatch(toggleTurn());
			setSelectedPiece(null);
			console.log("RECIEVED DATA", moveFromIndex, moveToIndex);
		}
		// eslint-disable-next-line
	}, [moveFromIndex, moveToIndex]); //multiplayer

	useEffect(() => {
		if (playState !== null) {
			setBoardState(playState.serverBoardState);
			setPrevMove(playState.serverPrevMove);
			setWhiteCastling(playState.serverWhiteCastling);
			setBlackCastling(playState.serverBlackCastling);

			if (playState.serverTurn !== turn) {
				dispatch(toggleTurn());
			}
		}
		// eslint-disable-next-line
	}, [playState, dispatch]);

	const board = boardState.map((row, i) => {
		let newRow = row.map((_, j) => {
			return (
				<Square
					boardState={boardState}
					key={i * 10 + j}
					position={i * 10 + j}
					colour={(i + j) % 2 ? "bg-chess-light" : "bg-chess-dark"}
					selectedPiece={selectedPiece}
					setSelectedPiece={setSelectedPiece}
					prevMove={prevMove}
					whiteCastling={whiteCastling}
					blackCastling={blackCastling}
					pawnPromotionOpen={pawnPromotionOpen}
					gameEnded={gameEnded}
					socket={socket}
					clientTurnColour={clientTurnColour}
					setPromotedPiecePosition={setPromotedPiecePosition}
					setpawnPromotionOpen={setpawnPromotionOpen}
				/>
			);
		});
		return (
			<div className="flex flex-row" key={uuidv4()}>
				{newRow}
			</div>
		);
	});

	return (
		<>
			{/* <Image
				className="absolute opacity-10"
				src="/Images/woodenBackground.jpg"
				alt="Description of the image"
				width={1920}
				height={1080}
			/> */}
			<div className="flex flex-row gap-10 bg-room-bg">
				<div className="flex flex-col-reverse items-center justify-center w-screen h-screen">
					<div className="flex flex-col-reverse">{board}</div>
					<div className="absolute z-20 -translate-x-10">
						<PawnPromotion
							open={pawnPromotionOpen}
							handleSelect={handlePromotion}
						/>
					</div>
				</div>

				<div className="absolute flex flex-col top-1/2 right-1/2 translate-x-44 -translate-y-[260px] sm:top-1/2 sm:right-1/2 sm:translate-x-52 sm:-translate-y-72 md:top-1/2 md:right-1/2 md:translate-x-64 md:-translate-y-[360px] lg:right-10 lg:top-1/4 lg:translate-x-0 lg:translate-y-0 item-start justify-center">
					<Timer
						playTime={playTime}
						timerFor={"b"}
						turn={turn}
						pawnPromotionOpen={pawnPromotionOpen}
						setIsTimeUp={setIsTimeUp}
						gameEnded={gameEnded}
					/>
				</div>

				<div className="absolute flex flex-col top-1/2 right-1/2 translate-x-44 translate-y-52 sm:bottom-1/2 sm:right-1/2 sm:translate-x-52 sm:translate-y-64 md:top-1/2 md:right-1/2 md:translate-x-64 md:translate-y-80 lg:right-10 lg:bottom-1/4 lg:translate-x-0 lg:translate-y-0 item-start justify-center">
					<Timer
						playTime={playTime}
						timerFor={"w"}
						turn={turn}
						pawnPromotionOpen={pawnPromotionOpen}
						setIsTimeUp={setIsTimeUp}
						gameEnded={gameEnded}
					/>
				</div>

				<div
					className={`absolute top-1/3 left-1/2 w-40 h-40 bg-white flex-col items-center justify-center z-50 ${
						gameEnded ? "" : "hidden"
					}`}
				>
					<p>
						{victoryOrLoss
							? turn === "b"
								? "White Wins"
								: "Black Wins"
							: "DRAW"}
					</p>
					<p>
						{isCheckMate ? "By Checkmate" : ""}
						{isTimeUp ? "By Timeout" : ""}
						{isStaleMate && "By Stalemate"}{" "}
						{hasInsufficientMaterial && "By Insufficient Material"}
						{isThreeFoldRepetion && "by Three Fold Repetition"}
					</p>
				</div>
			</div>
			<audio ref={moveSound} src="/sound/move.mp3" />
			<audio ref={checkSound} src="/sound/check.mp3" />
			<audio ref={captureSound} src="/sound/capture.mp3" />
			<audio ref={promoteSound} src="/sound/promote.mp3" />
			<audio ref={endSound} src="/sound/end.mp3" />

			<div
				className={`${playerFont.className} absolute md:w-48 lg:w-52 h-fit p-4 bg-room-secondary text-amber-950 md:top-1/2 md:right-1/2 md:-translate-x-14 md:-translate-y-[340px] lg:top-1/2 lg:right-1/2 lg:-translate-x-28 lg:-translate-y-[400px] lg:gap-4 md:gap-4 flex justify-start items-center rounded-xl font-extrabold lg:text-xl md:text-lg`}
			>
				<div className="lg:text-3xl md:text-2xl">
					<FaChessRook />
				</div>
				Hellooo
			</div>
			<div className="absolute lg:w-52 md:w-48 h-fit md:p-5 lg:p-4 bg-room-secondary text-amber-950 md:bottom-1/2 md:right-1/2 md:-translate-x-14 md:translate-y-[350px] lg:top-1/2 lg:right-1/2 lg:-translate-x-28 lg:translate-y-[340px] lg:gap-3 md:gap-4 flex justify-center items-center rounded-xl font-extrabold lg:text-xl md:text-base">
				<div className="lg:text-3xl md:text-2xl">
					<FaChessRook />
				</div>
				Byeeeeeeeeeee
			</div>
		</>
	);
}
