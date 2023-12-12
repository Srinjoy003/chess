const pieceValue: { [key: string]: number } = {
    'P' : 1,
    'Q' : 20,
    'R' : 8,
    'B' : 6,
    'H' : 6,
    'K' : 100
}

export function Evaluate(boardState: string[][]): number{
    let boardEvaluation = 0;
    
    for(let row = 0; row < 8; row++){
        for(let col = 0; col < 8; col++){
            const piece = boardState[row][col];

            if(piece !== "-"){
            const sign = piece[0] === "w" ? 1 : -1;
            boardEvaluation += pieceValue[piece[1]] * sign;


            }
        }

    }

    return boardEvaluation;
    
}

export function MiniMax(boardState: string[][]){
    
}