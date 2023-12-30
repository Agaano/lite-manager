import { PhysicalPosition, appWindow } from '@tauri-apps/api/window'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import styles from './TopBar.module.scss'

export default function TopBar() {
	const [mouseDown, setMouseDown] = useState(false)
	const [mousePos, setMousePos] = useState<null | number[]>(null)
	const router = useSelector((state: RootState) => state.router)

	function resetMouseInfo() {
		setMouseDown(false)
		setMousePos(null)
	}

	function dragWindow(e: React.MouseEvent<HTMLElement, MouseEvent>) {
		if (mouseDown) {
			if (!mousePos) {
				setMousePos([e.screenX, e.screenY])
				return
			}
			appWindow.setPosition(
				new PhysicalPosition(
					window.screenX + (e.screenX - mousePos[0]),
					window.screenY + (e.screenY - mousePos[1])
				)
			)
			setMousePos([e.screenX, e.screenY])
		}
	}

	return (
		<header
			draggable={false}
			className={styles.header}
			onBlur={resetMouseInfo}
			onMouseDown={() => setMouseDown(true)}
			onMouseUp={resetMouseInfo}
			onMouseLeave={resetMouseInfo}
			onMouseMove={dragWindow}
		>
			<span>{router.title}</span>
			<div>
				<button
					onClick={() => {
						appWindow.minimize()
					}}
				>
					<img src='icons/minimize_icon.svg ' width={25} />
				</button>
				<button
					onClick={() => {
						appWindow.close()
					}}
				>
					<img src='icons/cross_icon.svg' width={25} />
				</button>
			</div>
		</header>
	)
}
