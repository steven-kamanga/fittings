import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { createNoopStorage } from "./noop_storage";
import scrollReducer from "../slices/scroll_slice";
import toggleReducer from "../slices/nav_toggle_slice";

const isServer = typeof window === "undefined";

const persistConfig = {
  key: "root",
  storage: isServer ? createNoopStorage() : storage,
  whitelist: ["scroll", "toggle"],
};

const rootReducer = combineReducers({
  scroll: scrollReducer,
  toggle: toggleReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: process.env.NODE_ENV === "development",
});

export const makeStore = () => store;

export const getState = () => store.getState();
export const dispatch = store.dispatch;

export const persistor = persistStore(store);
