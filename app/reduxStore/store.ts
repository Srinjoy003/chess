'use client'

import { configureStore } from "@reduxjs/toolkit";
import turnReducer from "./turnSlice";


export const store = configureStore({
	reducer: {
        turn: turnReducer,
      
    },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;


