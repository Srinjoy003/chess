import { TotalMoveList } from "./aiMoves";
import { EnPassantMoveList, CastlingMoveList } from "../helperFunctions";



function MoveGenerator(
	boardState: string[][],
	currentTurn: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
): number {
	const totalMoveList = TotalMoveList(
		boardState,
		currentTurn,
		prevMove,
		whiteCastling,
		blackCastling
	);
    for(let move of totalMoveList){
        const [fromIndex, toIndex] = move;
        MoveMaker(boardState, fromIndex, toIndex, "hello", prevMove, whiteCastling, blackCastling)
    }
	return totalMoveList.length;
}

function MoveMaker(
	boardState: string[][],
	fromIndex: number,
	toIndex: number,
	promotedPiece: string,
	prevMove: [number, number] | null,
	whiteCastling: [boolean, boolean, boolean],
	blackCastling: [boolean, boolean, boolean]
) {
	const i1 = Math.floor(fromIndex / 10);
	const j1 = fromIndex % 10;

	const i2 = Math.floor(toIndex / 10);
	const j2 = toIndex % 10;

	const piece = boardState[i1][j1];

	if (
		!(
			(
				piece[1][1] === "P" &&
				((piece[1][0] == "w" && i2 === 7) || (piece[1][0] == "b" && i2 === 0))
			) //no pawn promotion
		)
	) {
		boardState[i2][j2] = boardState[i1][j1];
		boardState[i1][j1] = "-";
	} else if (
		//pawn promotion
		piece[1] === "P" &&
		((piece[0] === "w" && i2 === 7) || (piece[0] === "b" && i2 === 0))
	) {
		boardState[i2][j2] = piece[0] + "Q";
		boardState[i1][j1] = "-";
	}

	let currentSelectedPiece: [number, string] = [fromIndex, piece];

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
		const opponentPawnDirection = currentSelectedPiece[1][0] === "w" ? -1 : 1;
		boardState[i2 + opponentPawnDirection][j2] = "-";
	}

	//                 //FOR CASTLING

	if (castlingMoveList.includes(toIndex)) {
		if (toIndex === 2) {
			boardState[0][0] = "-";
			boardState[0][3] = "wR";
		} else if (toIndex === 6) {
			boardState[0][7] = "-";
			boardState[0][5] = "wR";
		}

		if (toIndex === 72) {
			boardState[7][0] = "-";
			boardState[7][3] = "bR";
		} else if (toIndex === 76) {
			boardState[7][7] = "-";
			boardState[7][5] = "bR";
		}
	}

	if (currentSelectedPiece[1][0] === "w") {
		//white
		if (currentSelectedPiece[0] === 0 && currentSelectedPiece[1][1] === "R") {
			//left Rook
			whiteCastling = [true, whiteCastling[1], whiteCastling[2]];
		} else if (
			currentSelectedPiece[0] === 7 &&
			currentSelectedPiece[1][1] === "R"
		) {
			//  right rook
			whiteCastling = [whiteCastling[0], whiteCastling[1], true];
		} else if (
			currentSelectedPiece[0] === 4 &&
			currentSelectedPiece[1][1] === "K"
		) {
			// king
			whiteCastling = [whiteCastling[0], true, whiteCastling[2]];
		}
	}

	if (currentSelectedPiece[1][0] === "b") {
		//black
		if (currentSelectedPiece[0] === 70 && currentSelectedPiece[1][1] === "R") {
			blackCastling = [true, blackCastling[1], blackCastling[2]];
		} else if (
			currentSelectedPiece[0] === 77 &&
			currentSelectedPiece[1][1] === "R"
		) {
			blackCastling = [blackCastling[0], blackCastling[1], true];
		} else if (
			currentSelectedPiece[0] === 74 &&
			currentSelectedPiece[1][1] === "K"
		) {
			blackCastling = [blackCastling[0], true, blackCastling[2]];
		}
	}
}

// const movePiece = useCallback(
//     (fromIndex: number, toIndex: number, ai: boolean) => {
//         if (fromIndex != toIndex) {
//             const updatedBoard = boardState.map((item) => {
//                 return item.slice();
//             });

//             const i1 = Math.floor(fromIndex / 10);
//             const j1 = fromIndex % 10;

//             const i2 = Math.floor(toIndex / 10);
//             const j2 = toIndex % 10;

//             if (
//                 !(
//                     (
//                         selectedPiece &&
//                         selectedPiece[1][1] === "P" &&
//                         ((selectedPiece[1][0] == "w" && i2 === 7) ||
//                             (selectedPiece[1][0] == "b" && i2 === 0))
//                     ) //no pawn promotion
//                 )
//             ) {
//                 if (updatedBoard[i2][j2] === "-") setSound("move");
//                 else setSound("capture");

//                 updatedBoard[i2][j2] = updatedBoard[i1][j1];
//                 updatedBoard[i1][j1] = "-";
//             }

//             //PAWN PROMOTION FOR AI

//             if (ai) {
//                 //for ai
//                 const aiPiece = boardState[i1][j1];
//                 setSelectedPiece([fromIndex, aiPiece]);

//                 if (
//                     aiPiece[1] === "P" &&
//                     ((aiPiece[0] === "w" && i2 === 7) ||
//                         (aiPiece[0] === "b" && i2 === 0))
//                 ) {
//                     setPromotedPiecePosition([fromIndex, toIndex]);
//                     updatedBoard[i2][j2] = turn + "Q";
//                     updatedBoard[i1][j1] = "-";
//                     setSound("promote");
//                     dispatch(toggleTurn());
//                     setBoardState(updatedBoard);
//                     noOfMoves.current++;
//                     return;
//                 }
//             }

//             if (selectedPiece || ai) {
//                 const aiPiece = boardState[i1][j1];
//                 let currentSelectedPiece: [number, string] = [-1, "hello"];

//                 if (selectedPiece) currentSelectedPiece = selectedPiece;
//                 else currentSelectedPiece = [fromIndex, aiPiece];

//                 //ENPASSANT
//                 const enpassantMoveList = EnPassantMoveList(
//                     currentSelectedPiece[1],
//                     currentSelectedPiece[0],
//                     boardState,
//                     prevMove
//                 );

//                 const castlingMoveList = CastlingMoveList(
//                     currentSelectedPiece[1],
//                     boardState,
//                     whiteCastling,
//                     blackCastling
//                 );

//                 if (enpassantMoveList.includes(toIndex)) {
//                     setSound("capture");
//                     const opponentPawnDirection =
//                         currentSelectedPiece[1][0] === "w" ? -1 : 1;
//                     updatedBoard[i2 + opponentPawnDirection][j2] = "-";
//                 }

//                 // PAWN PROMOTION

//                 //for human
//                 if (currentSelectedPiece[1][1] === "P") {
//                     if (
//                         (currentSelectedPiece[1][0] == "w" && i2 === 7) ||
//                         (currentSelectedPiece[1][0] == "b" && i2 === 0)
//                     ) {
//                         setpawnPromotionOpen(() => {
//                             setPromotedPiecePosition([fromIndex, toIndex]);
//                             return true;
//                         });
//                     }
//                 }

//                 //FOR CASTLING

//                 if (castlingMoveList.includes(toIndex)) {
//                     if (toIndex === 2) {
//                         updatedBoard[0][0] = "-";
//                         updatedBoard[0][3] = "wR";
//                     } else if (toIndex === 6) {
//                         updatedBoard[0][7] = "-";
//                         updatedBoard[0][5] = "wR";
//                     }

//                     if (toIndex === 72) {
//                         updatedBoard[7][0] = "-";
//                         updatedBoard[7][3] = "bR";
//                     } else if (toIndex === 76) {
//                         updatedBoard[7][7] = "-";
//                         updatedBoard[7][5] = "bR";
//                     }
//                 }

//                 if (currentSelectedPiece[1][0] === "w") {
//                     //white
//                     if (
//                         currentSelectedPiece[0] === 0 &&
//                         currentSelectedPiece[1][1] === "R"
//                     ) {
//                         //left Rook
//                         setWhiteCastling((currWhiteCastling) => [
//                             true,
//                             currWhiteCastling[1],
//                             currWhiteCastling[2],
//                         ]);
//                     } else if (
//                         currentSelectedPiece[0] === 7 &&
//                         currentSelectedPiece[1][1] === "R"
//                     ) {
//                         //  right rook
//                         setWhiteCastling((currWhiteCastling) => [
//                             currWhiteCastling[0],
//                             currWhiteCastling[1],
//                             true,
//                         ]);
//                     } else if (
//                         currentSelectedPiece[0] === 4 &&
//                         currentSelectedPiece[1][1] === "K"
//                     ) {
//                         // king
//                         setWhiteCastling((currWhiteCastling) => [
//                             currWhiteCastling[0],
//                             true,
//                             currWhiteCastling[2],
//                         ]);
//                     }
//                 }

//                 if (currentSelectedPiece[1][0] === "b") {
//                     //black
//                     if (
//                         currentSelectedPiece[0] === 70 &&
//                         currentSelectedPiece[1][1] === "R"
//                     ) {
//                         setBlackCastling((currBlackCastling) => [
//                             true,
//                             currBlackCastling[1],
//                             currBlackCastling[2],
//                         ]);
//                     } else if (
//                         currentSelectedPiece[0] === 77 &&
//                         currentSelectedPiece[1][1] === "R"
//                     ) {
//                         setBlackCastling((currBlackCastling) => [
//                             currBlackCastling[0],
//                             currBlackCastling[1],
//                             true,
//                         ]);
//                     } else if (
//                         currentSelectedPiece[0] === 74 &&
//                         currentSelectedPiece[1][1] === "K"
//                     ) {
//                         setBlackCastling((currBlackCastling) => [
//                             currBlackCastling[0],
//                             true,
//                             currBlackCastling[2],
//                         ]);
//                     }
//                 }
//             }

//             if (
//                 !(
//                     (
//                         selectedPiece &&
//                         selectedPiece[1][1] === "P" &&
//                         ((selectedPiece[1][0] == "w" && i2 === 7) ||
//                             (selectedPiece[1][0] == "b" && i2 === 0))
//                     ) //no pawn promotion
//                 )
//             ) {
//                 noOfMoves.current++;
//                 setBoardState(updatedBoard);
//                 dispatch(toggleTurn());
//             }
//         }
//     },
//     [
//         blackCastling,
//         whiteCastling,
//         boardState,
//         dispatch,
//         prevMove,
//         selectedPiece,
//         turn,
//     ]
// )
