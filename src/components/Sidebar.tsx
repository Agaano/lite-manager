import { useDispatch } from 'react-redux'
import { navigate } from '../redux/slices/routerSlice'
import styles from './Sidebar.module.scss'

export default function Sidebar() {
	const dispatch = useDispatch()

	return (
		<aside>
			<div className={styles.top}>
				<div className={styles.logo}>
					<img src='logo.svg' />
					<span>LiteManager</span>
				</div>

				<nav>
					<table>
						<tbody>
							<tr onClick={() => dispatch(navigate({ page: 'dashboard' }))}>
								<td>
									<img src='icons/dashboard_icon.svg' />
								</td>
								<td>Dashboard</td>
							</tr>
							<tr onClick={() => dispatch(navigate({ page: 'settings' }))}>
								<td>
									<img src='icons/settings_icon.svg' />
								</td>
								<td>Settings</td>
							</tr>
							<tr onClick={() => dispatch(navigate({ page: 'sandbox' }))}>
								<td>
									<img src='icons/sandbox_icon.svg' />
								</td>
								<td>Sandbox</td>
							</tr>
							<tr onClick={() => dispatch(navigate({ page: 'about' }))}>
								<td>
									<img src='icons/about_icon.svg' />
								</td>
								<td>About</td>
							</tr>
						</tbody>
					</table>
				</nav>
			</div>
			<div className={styles.bottom}>
				<nav>
					<table>
						<tbody>
							<tr onClick={() => dispatch(navigate({ page: 'bugreport' }))}>
								<td>
									<img src='icons/bugreport_icon.svg' />
								</td>
								<td>BugReport</td>
							</tr>
							<tr onClick={() => dispatch(navigate({ page: 'support' }))}>
								<td>
									<img src='icons/support_icon.svg' />
								</td>
								<td>Support</td>
							</tr>
						</tbody>
					</table>
				</nav>
			</div>
		</aside>
	)
}
