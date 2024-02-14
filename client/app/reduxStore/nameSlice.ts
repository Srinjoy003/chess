import { createSlice } from '@reduxjs/toolkit';

const nameSlice = createSlice({
  name: 'name',
  initialState: "", 
  reducers: {
    setName: (state, action) => {
      return action.payload;
    },
  },
});

export const { setName } = nameSlice.actions;
export default nameSlice.reducer;
