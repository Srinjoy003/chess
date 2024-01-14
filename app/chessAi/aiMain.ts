import { ImprovedTotalMoveList } from "./aiMoves";
import { MoveMaker } from "./MoveGenerator";
import { deepCopyBoard, deepCopyCastling, deepCopyPrevMove } from "./MoveGenerator";
import { extractChessPosition } from "./aiHelperFunctions";
import PawnPromotion from "../components/PawnPromotion";
import { isGameOver } from "../helperFunctions";





export function Minimax(
    depth: number,
    currentDepth: number,
    boardState: string[][],
    currentTurn: string,
    prevMove: [number, number] | null,
    whiteCastling: [boolean, boolean, boolean],
    blackCastling: [boolean, boolean, boolean],
    maximizingPlayer: boolean
  ): number {
    if (currentDepth === 0 || isGameOver(boardState, currentTurn, prevMove, whiteCastling, blackCastling, positionList, currentPosition)) { //add these laterT
      // Evaluate the board and return the score
      return evaluateBoard(boardState, currentTurn);
    }
  
    if (prevMove === null) prevMove = [-1, -1];
  
    const totalMoveList = ImprovedTotalMoveList(
      boardState,
      currentTurn,
      prevMove,
      whiteCastling,
      blackCastling
    );
  
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (let move of totalMoveList) {
        // Apply the move to the board
        // ..

        const [fromIndex, toIndex] = move;

		const nextTurn = currentTurn === "w" ? "b" : "w";

		const i1 = Math.floor(fromIndex / 10);
		const j1 = fromIndex % 10;

		const i2 = Math.floor(toIndex / 10);
		const j2 = toIndex % 10;

		const piece = boardState[i1][j1];

		const promotionList = ["Q", "B", "H", "R"];


		if (
			//pawn promotion
			piece[1] === "P" &&
			((piece[0] === "w" && i2 === 7) || (piece[0] === "b" && i2 === 0))
		) {
			for (let promotionMove of promotionList) {
				const newBoardState = deepCopyBoard(boardState);
				const newWhiteCastling = deepCopyCastling(whiteCastling);
				const newBlackCastling = deepCopyCastling(blackCastling);
				const newPrevMove = deepCopyPrevMove(prevMove);

				MoveMaker(
					newBoardState,
					fromIndex,
					toIndex,
					promotionMove,
					prevMove,
					newWhiteCastling,
					newBlackCastling
				);


				if (newPrevMove) { 
					newPrevMove[0] = fromIndex;
					newPrevMove[1] = toIndex;
				}

				const evaluation = Minimax(
                    depth,
                    currentDepth - 1,
                    newBoardState, // Updated board state after the move
                    nextTurn,
                    newPrevMove,
                    newWhiteCastling,
                    newBlackCastling,
                    false // Switch to minimizing player
                  );
            
                  maxEval = Math.max(maxEval, evaluation);

				
			}
		} else {
			const newBoardState = deepCopyBoard(boardState);
			const newWhiteCastling = deepCopyCastling(whiteCastling);
			const newBlackCastling = deepCopyCastling(blackCastling);
			const newPrevMove = deepCopyPrevMove(prevMove);

			MoveMaker(
				newBoardState,
				fromIndex,
				toIndex,
				"no promotion",
				prevMove,
				newWhiteCastling,
				newBlackCastling
			);

			if (newPrevMove) {
				newPrevMove[0] = fromIndex;
				newPrevMove[1] = toIndex;
			}

			const evaluation = Minimax(
                depth,
                currentDepth - 1,
                newBoardState, // Updated board state after the move
                nextTurn,
                newPrevMove,
                newWhiteCastling,
                newBlackCastling,
                false // Switch to minimizing player
              );
        
              maxEval = Math.max(maxEval, evaluation);

		
		}

      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of totalMoveList) {
        // Apply the move to the board
        // ...

        const [fromIndex, toIndex] = move;

		const nextTurn = currentTurn === "w" ? "b" : "w";

		const i1 = Math.floor(fromIndex / 10);
		const j1 = fromIndex % 10;

		const i2 = Math.floor(toIndex / 10);
		const j2 = toIndex % 10;

		const piece = boardState[i1][j1];

		const promotionList = ["Q", "B", "H", "R"];


		if (
			//pawn promotion
			piece[1] === "P" &&
			((piece[0] === "w" && i2 === 7) || (piece[0] === "b" && i2 === 0))
		) {
			for (let promotionMove of promotionList) {
				const newBoardState = deepCopyBoard(boardState);
				const newWhiteCastling = deepCopyCastling(whiteCastling);
				const newBlackCastling = deepCopyCastling(blackCastling);
				const newPrevMove = deepCopyPrevMove(prevMove);

				MoveMaker(
					newBoardState,
					fromIndex,
					toIndex,
					promotionMove,
					prevMove,
					newWhiteCastling,
					newBlackCastling
				);


				if (newPrevMove) { 
					newPrevMove[0] = fromIndex;
					newPrevMove[1] = toIndex;
				}

                const evaluation = Minimax(
                    depth,
                    currentDepth - 1,
                    newBoardState, // Updated board state after the move
                    nextTurn,
                    newPrevMove,
                    newWhiteCastling,
                    newBlackCastling,
                    true // Switch to maximizing player
                  );
            
                  minEval = Math.min(minEval, evaluation);

				
			}
		} else {
			const newBoardState = deepCopyBoard(boardState);
			const newWhiteCastling = deepCopyCastling(whiteCastling);
			const newBlackCastling = deepCopyCastling(blackCastling);
			const newPrevMove = deepCopyPrevMove(prevMove);

			MoveMaker(
				newBoardState,
				fromIndex,
				toIndex,
				"no promotion",
				prevMove,
				newWhiteCastling,
				newBlackCastling
			);

			if (newPrevMove) {
				newPrevMove[0] = fromIndex;
				newPrevMove[1] = toIndex;
			}

            const evaluation = Minimax(
                depth,
                currentDepth - 1,
                newBoardState, // Updated board state after the move
                nextTurn,
                newPrevMove,
                newWhiteCastling,
                newBlackCastling,
                true // Switch to maximizing player
              );
        
              minEval = Math.min(minEval, evaluation);

		
		}

      }
   
      return minEval;
    }
  }
  

