import { combineReducers, configureStore } from '@reduxjs/toolkit'
import routerSlice from './slices/routerSlice'

const rootReducer = combineReducers({ router: routerSlice })

export type RootState = ReturnType<typeof rootReducer>

const store = configureStore({
	reducer: rootReducer,
})

export default store
