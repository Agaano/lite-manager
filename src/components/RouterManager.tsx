import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import dashboard from './Pages/dashboard'
import fileEditor from './Pages/fileEditor'

export default () => {
	const router = useSelector((state: RootState) => state.router)
	const pages = {
		dashboard: dashboard,
		settings: () => <></>,
		sandbox: () => <></>,
		about: () => <></>,
		bugreport: () => <></>,
		support: () => <></>,
		folder: () => <></>,
		file: fileEditor,
	}
	const Page = useMemo(() => {
		if (!pages[router.current]) return () => <></>
		return pages[router.current]
	}, [router.current])
	return (
		<section className='page'>
			<Page />
		</section>
	)
}
