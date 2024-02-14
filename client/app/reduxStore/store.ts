"use client";

import { configureStore } from "@reduxjs/toolkit";
import turnReducer from "./turnSlice";
import nameReducer from "./nameSlice";

export const store = configureStore({
	reducer: {
		turn: turnReducer,
		name: nameReducer,
	},
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;
