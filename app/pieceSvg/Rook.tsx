import { ChessPieceProp } from "./ChessPieceProps";

export function BlackRook({size}: ChessPieceProp) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 45 45">
      <g
        fillRule="evenodd"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="butt"
          d="M9 39h27v-3H9v3zm3.5-7l1.5-2.5h17l1.5 2.5h-20zm-.5 4v-4h21v4H12z"
        ></path>
        <path
          strokeLinecap="butt"
          strokeLinejoin="miter"
          d="M14 29.5v-13h17v13H14z"
        ></path>
        <path
          strokeLinecap="butt"
          d="M14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z"
        ></path>
        <path
          fill="none"
          stroke="#ececec"
          strokeLinejoin="miter"
          strokeWidth="1"
          d="M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23"
        ></path>
      </g>
    </svg>
  );
}


export function WhiteRook({size}: ChessPieceProp) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 45 45">
      <g
        fill="#fff"
        fillRule="evenodd"
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="butt"
          d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm-1-22V9h4v2h5V9h5v2h5V9h4v5"
        ></path>
        <path d="M34 14l-3 3H14l-3-3"></path>
        <path
          strokeLinecap="butt"
          strokeLinejoin="miter"
          d="M31 17v12.5H14V17"
        ></path>
        <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"></path>
        <path fill="none" strokeLinejoin="miter" d="M11 14h23"></path>
      </g>
    </svg>
  );
}


