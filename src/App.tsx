import { useEffect } from 'react'
import './App.css'
import RouterManager from './components/RouterManager'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import { Init, getFilesInFolder } from './lib/SaveManager'

function App() {
	useEffect(() => {
		;(async () => {
			await Init()
			console.log(await getFilesInFolder('get'))
		})()
	}, [])

	return (
		<div className='container'>
			<Sidebar />
			<div>
				<TopBar />
				<RouterManager />
			</div>
		</div>
	)
}

export default App
