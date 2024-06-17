import { PayloadAction, createSlice } from '@reduxjs/toolkit'

export type PagesType =
	| 'dashboard'
	| 'settings'
	| 'sandbox'
	| 'about'
	| 'bugreport'
	| 'support'
	| 'folder'
	| 'file'

const pagesInfo = {
	dashboard: 'Dashboard',
	settings: 'Settings',
	sandbox: 'Sandbox Mode',
	about: 'About',
	bugreport: 'Bug report',
	support: 'Support',
	folder: 'Folder - ',
	file: 'File - ',
}

type RouterType = {
	current: PagesType
	title: string
	body?: { [key: string]: any }
}

const initialState: RouterType = { current: 'dashboard', title: 'Dashboard' }

const routerSlice = createSlice({
	initialState,
	name: 'router',
	reducers: {
		navigate: (
			state,
			action: PayloadAction<{ page: PagesType; body?: { [key: string]: any } }>
		) => {
			state.title =
				pagesInfo[action.payload.page] + (action.payload.body?.name ?? '')
			state.current = action.payload.page
			state.body = action.payload.body
		},
	},
})

export default routerSlice.reducer
export const { navigate } = routerSlice.actions
