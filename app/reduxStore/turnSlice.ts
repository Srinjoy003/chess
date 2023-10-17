import { createSlice } from '@reduxjs/toolkit';

const turnSlice = createSlice({
  name: 'turn',
  initialState: "w", 
  reducers: {
    toggleTurn: (state) => {
      return state === "w" ? "b" : "w"; // Toggle between "w" and "b"
    },
  },
});

export const { toggleTurn } = turnSlice.actions;
export default turnSlice.reducer;
