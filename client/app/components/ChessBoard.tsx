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
import { FaChessKing } from "react-icons/fa6";

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

	let aiRandomMoveWhite = useRef<number[]>([]);
	let aiRandomMoveBlack = useRef<number[]>([]);
	let aiMinimaxMove = useRef<[number, number, string] | null>(null);

	useEffect(() => {
		//Mate pos
		// const fen = "8/3Qr2B/N2q4/3N4/2b1R3/P2k4/rP3B2/R3K3 w - - 0 1";
		// const fen = "8/k1PK4/p7/8/4B3/8/8/1R6 w - - 0 1";
		// const fen =
		// 	"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1";
		// const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
		// 	const fen =
		// 		"r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - ";
		// const fen = "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - ";
		// const fen =
		// 	"r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1";
		// const fen = "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8";
		// const fen =
		// 	"r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1R1K w kq - 0 1";
		// const fen = "7r/8/8/8/8/6p1/6PP/5kBK b - - 0 1";
		// const fen = "8/8/8/8/8/6pr/6PP/5kBK w - - 0 1"; //black mate
		// const fen = "kbK5/pp6/RP6/8/8/8/8/8 b - - 0 1"; //white mate
		// const fen = "kbK5/pp6/RP6/8/8/8/8/8 w - - 0 1"; //white mate
		// const whiteCastling: [boolean, boolean, boolean] = [true, true, true];
		// const blackCastling: [boolean, boolean, boolean] = [true, true, true];
		// const prevMove: [number, number] = [-1, -1];
		// const [currentTurn, boardState] = fenToChessboard(
		// 	fen,
		// 	whiteCastling,
		// 	blackCastling,
		// 	prevMove
		// );
		// // const maximising = currentTurn === "w" ? true : false;
		// setBoardState(boardState);
		// setPrevMove(prevMove);
		// setWhiteCastling(whiteCastling);
		// setBlackCastling(blackCastling);
		// const nodeCount = { value: 0 };
		// const transpositionTable: TranspositionTable = {};
		// const endTime = Date.now() + 3000;
		// const tick = performance.now();
		// const cancel = { isCancelled: false };
		// const { bestMove, bestScore } = Minimax(
		// 	3,
		// 	boardState,
		// 	currentTurn,
		// 	prevMove,
		// 	whiteCastling,
		// 	blackCastling,
		// 	maximising,
		// 	nodeCount,
		// 	transpositionTable,
		// 	endTime,
		// 	cancel
		// );
		// const { finalBestMove, finalBestScore } = iterativeDeepeningSearch(
		// 	boardState,
		// 	currentTurn,
		// 	prevMove,
		// 	whiteCastling,
		// 	blackCastling,
		// 	3000
		// );
		// const tock = performance.now();
		// if (finalBestMove !== null) {
		// 	const [fromIndex, toIndex, promotionMove] = finalBestMove;
		// 	const fromPos = extractChessPosition(fromIndex);
		// 	const toPos = extractChessPosition(toIndex);
		// 	console.log("\n Final Output:\n");
		// 	console.log(fromPos + toPos + promotionMove, finalBestScore);
		// }
		// console.log("Time: ", tock - tick);
		// console.log("Nodes Searched: ", nodeCount.value);
		// const tick = performance.now()
		// for(let i = 1; i < 5; i++)
		// console.log(i, MoveGenerator(i,i, boardState, currentTurn, prevMove, whiteCastling, blackCastling))
		// const tock = performance.now()
		// console.log("Time: ", tock - tick)
		// const tick = performance.now();
		// EngineTest();
		// const tock = performance.now();
		// console.log("Time: ", tock - tick)
		// EvaluationTest();
		// const moveList: string[] = ["e2e4"];
		// const nextMove: string | null = findOpeningMove(moveList);
		// if (nextMove !== null) {
		// 	console.log(`The next move in the opening is: ${nextMove}`);
		// } else {
		// 	console.log("No matching opening line found.");
		// }
	}, [dispatch]);

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
		(piece: string, ai: boolean) => {
			setpawnPromotionOpen(false);
			setSound("promote");

			if (promotedPiecePosition) {
				const updatedBoard = boardState.map((item) => {
					return item.slice();
				});

				const i1 = Math.floor(promotedPiecePosition[0] / 10);
				const j1 = promotedPiecePosition[0] % 10;

				const i2 = Math.floor(promotedPiecePosition[1] / 10);
				const j2 = promotedPiecePosition[1] % 10;

				updatedBoard[i2][j2] = piece;

				if (turn === "w") {
					updatedBoard[i1][j1] = "-";
				} else {
					updatedBoard[i1][j1] = "-";
				}

				dispatch(toggleTurn());
				setBoardState(updatedBoard);
				noOfMoves.current++;
			}
		},
		[turn, boardState, promotedPiecePosition, dispatch]
	);

	const movePiece = useCallback(
		(
			fromIndex: number,
			toIndex: number,
			ai: boolean,
			recieved: boolean = false,
			aiPromotionMove: string = "Q"
		) => {
			if (fromIndex != toIndex) {
				const updatedBoard = boardState.map((item) => {
					return item.slice();
				});

				const i1 = Math.floor(fromIndex / 10);
				const j1 = fromIndex % 10;

				const i2 = Math.floor(toIndex / 10);
				const j2 = toIndex % 10;

				const uciMove = moveToUCI(fromIndex, toIndex);
				setMoveList((prevMoveList) => [...prevMoveList, uciMove]);

				if (
					!(
						(
							selectedPiece &&
							selectedPiece[1][1] === "P" &&
							((selectedPiece[1][0] == "w" && i2 === 7) ||
								(selectedPiece[1][0] == "b" && i2 === 0))
						) //no pawn promotion
					)
				) {
					if (updatedBoard[i2][j2] === "-") setSound("move");
					else setSound("capture");

					updatedBoard[i2][j2] = updatedBoard[i1][j1];
					updatedBoard[i1][j1] = "-";
				}

				//PAWN PROMOTION FOR AI

				if (ai) {
					//for ai
					const aiPiece = boardState[i1][j1];
					setSelectedPiece([fromIndex, aiPiece]);

					if (
						aiPiece[1] === "P" &&
						((aiPiece[0] === "w" && i2 === 7) ||
							(aiPiece[0] === "b" && i2 === 0))
					) {
						setPromotedPiecePosition([fromIndex, toIndex]);
						updatedBoard[i2][j2] = turn + aiPromotionMove;
						updatedBoard[i1][j1] = "-";
						setSound("promote");
						dispatch(toggleTurn());
						setBoardState(updatedBoard);
						noOfMoves.current++;
						return;
					}
				}

				if (selectedPiece || ai) {
					const aiPiece = boardState[i1][j1];
					let currentSelectedPiece: [number, string] = [-1, "hello"];

					if (selectedPiece) currentSelectedPiece = selectedPiece;
					else currentSelectedPiece = [fromIndex, aiPiece];

					//ENPASSANT
					const enpassantMoveList = EnPassantMoveList(
						currentSelectedPiece[1],
						currentSelectedPiece[0],
						boardState,
						prevMove
					);

					const castlingMoveList = CastlingMoveList(
						currentSelectedPiece[1],
						boardState,
						whiteCastling,
						blackCastling
					);

					if (enpassantMoveList.includes(toIndex)) {
						setSound("capture");
						const opponentPawnDirection =
							currentSelectedPiece[1][0] === "w" ? -1 : 1;
						updatedBoard[i2 + opponentPawnDirection][j2] = "-";
					}

					// PAWN PROMOTION

					//for human
					if (currentSelectedPiece[1][1] === "P") {
						if (
							(currentSelectedPiece[1][0] == "w" && i2 === 7) ||
							(currentSelectedPiece[1][0] == "b" && i2 === 0)
						) {
							setpawnPromotionOpen(() => {
								setPromotedPiecePosition([fromIndex, toIndex]);
								return true;
							});
							socket.emit("move", {
								fromIndex,
								toIndex,
								promotionMove: boardState[i2][j2][1],
							});
							console.log("sent promotion", boardState[i2][j2][1]);
						}
					}

					//FOR CASTLING

					if (castlingMoveList.includes(toIndex)) {
						if (toIndex === 2) {
							updatedBoard[0][0] = "-";
							updatedBoard[0][3] = "wR";
						} else if (toIndex === 6) {
							updatedBoard[0][7] = "-";
							updatedBoard[0][5] = "wR";
						}

						if (toIndex === 72) {
							updatedBoard[7][0] = "-";
							updatedBoard[7][3] = "bR";
						} else if (toIndex === 76) {
							updatedBoard[7][7] = "-";
							updatedBoard[7][5] = "bR";
						}
					}

					if (currentSelectedPiece[1][0] === "w") {
						//white
						if (
							currentSelectedPiece[0] === 0 &&
							currentSelectedPiece[1][1] === "R"
						) {
							//left Rook
							setWhiteCastling((currWhiteCastling) => [
								true,
								currWhiteCastling[1],
								currWhiteCastling[2],
							]);
						} else if (
							currentSelectedPiece[0] === 7 &&
							currentSelectedPiece[1][1] === "R"
						) {
							//  right rook
							setWhiteCastling((currWhiteCastling) => [
								currWhiteCastling[0],
								currWhiteCastling[1],
								true,
							]);
						} else if (
							currentSelectedPiece[0] === 4 &&
							currentSelectedPiece[1][1] === "K"
						) {
							// king
							setWhiteCastling((currWhiteCastling) => [
								currWhiteCastling[0],
								true,
								currWhiteCastling[2],
							]);
						}
					}

					if (currentSelectedPiece[1][0] === "b") {
						//black
						if (
							currentSelectedPiece[0] === 70 &&
							currentSelectedPiece[1][1] === "R"
						) {
							setBlackCastling((currBlackCastling) => [
								true,
								currBlackCastling[1],
								currBlackCastling[2],
							]);
						} else if (
							currentSelectedPiece[0] === 77 &&
							currentSelectedPiece[1][1] === "R"
						) {
							setBlackCastling((currBlackCastling) => [
								currBlackCastling[0],
								currBlackCastling[1],
								true,
							]);
						} else if (
							currentSelectedPiece[0] === 74 &&
							currentSelectedPiece[1][1] === "K"
						) {
							setBlackCastling((currBlackCastling) => [
								currBlackCastling[0],
								true,
								currBlackCastling[2],
							]);
						}
					}
				}

				if (
					!(
						(
							selectedPiece &&
							selectedPiece[1][1] === "P" &&
							((selectedPiece[1][0] == "w" && i2 === 7) ||
								(selectedPiece[1][0] == "b" && i2 === 0))
						) //no pawn promotion
					)
				) {
					noOfMoves.current++;
					dispatch(toggleTurn());
					socket.emit("move", { fromIndex, toIndex, promotionMove: "" });

					setBoardState(() => {
						return updatedBoard;
					});
				}
			}
		},
		[
			blackCastling,
			whiteCastling,
			boardState,
			dispatch,
			prevMove,
			selectedPiece,
			turn,
			socket,
		]
	);

	const aiMove = useCallback(() => {
		const aiTurn: string = "b";
		const maximising = aiTurn === "w" ? true : false;
		const endTime = Date.now() + 3000; //change while using

		if (turn === aiTurn) {
			const nodeCount = { value: 0 };
			const transpositionTable: TranspositionTable = {};
			const cancel = { isCancelled: false };

			const { finalBestMove, finalBestScore } = MakeEngineMove(
				boardState,
				aiTurn,
				prevMove,
				whiteCastling,
				blackCastling,
				4000,
				moveList
			);

			aiMinimaxMove.current = finalBestMove;
			console.log("Evaluation:", finalBestScore, finalBestMove);
		}

		if (turn === aiTurn) {
			console.log("Plays Move");
			if (aiMinimaxMove.current) {
				movePiece(
					aiMinimaxMove.current[0],
					aiMinimaxMove.current[1],
					true,
					false,
					aiMinimaxMove.current[2]
				);
				setPrevMove([aiMinimaxMove.current[0], aiMinimaxMove.current[1]]);
				setSelectedPiece(null);
			}
		}
	}, [
		boardState,
		blackCastling,
		whiteCastling,
		prevMove,
		turn,
		movePiece,
		moveList,
	]);

	useEffect(() => {
		const delay = 0; // Set the desired delay in milliseconds
		if (!gameEnded) {
			const timer = setTimeout(() => {
				// aiMove();
			}, delay);

			return () => clearTimeout(timer);
		} else {
			console.log("Game has ended");
		}
	}, [boardState, aiMove, gameEnded]);

	useEffect(() => {
		if (
			moveFromIndex !== null &&
			moveToIndex !== null &&
			promotionMove != null
		) {
			// movePiece(moveFromIndex, moveToIndex, false, true);
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
					movePiece={movePiece}
					selectedPiece={selectedPiece}
					setSelectedPiece={setSelectedPiece}
					prevMove={prevMove}
					setPrevMove={setPrevMove}
					whiteCastling={whiteCastling}
					blackCastling={blackCastling}
					pawnPromotionOpen={pawnPromotionOpen}
					gameEnded={gameEnded}
					socket={socket}
					clientTurnColour={clientTurnColour}
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

			<div className="absolute w-52 h-fit p-4 bg-room-secondary text-amber-950 lg:right-3/4 lg:top-36 lg:translate-x-64 lg:-translate-y-28 lg:gap-4 flex justify-start items-center rounded-2xl font-extrabold lg:text-xl">
				<div className=" text-xl lg:w-8 lg:h-8 flex items-center justify-center rounded-2xl text-amber-950 bg-room-secondary">
					<FaChessKing />
				</div>
				Hellooo
			</div>
			<div className="absolute w-52 h-fit p-4 bg-room-secondary text-amber-950 lg:right-3/4 lg:bottom-28 lg:translate-x-64 lg:translate-y-20 lg:gap-4 flex justify-center items-center rounded-2xl font-extrabold lg:text-xl">
				<div className="text-xl lg:w-8 lg:h-8 flex items-center justify-center rounded-2xl text-amber-950 bg-room-secondary">
					<FaChessKing />
				</div>
				Byeeeeeeeeee
			</div>
		</>
	);
}
