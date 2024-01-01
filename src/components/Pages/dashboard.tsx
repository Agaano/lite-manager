import { useEffect, useState } from 'react'
import { ArrayType, getFilesInFolder } from '../../lib/SaveManager'
import styles from './dashboard.module.scss'
import useModal from '../../hooks/useModal'
import CreateFileForm from '../CreateFileForm'
import ContextMenu from '../ContextMenu'

export default () => {
	const [prevFiles, setPrevFiles] = useState<ArrayType[]>([[]])
	const [files, setFiles] = useState<ArrayType>([])
	const [path, setPath] = useState<string[]>([])
	const FormModal = useModal();
	const [formModalOpen, setFormModalOpen] = useState(false);
	const [showContext, setShowContext] = useState(false);
	const [contextPos, setContextPos] = useState({x: 0, y: 0});
	const [contextOptions, setContextOptions] = useState([{onClick: () => {}, title: 'Title'}])
	useEffect(() => {
		renderFiles();
	}, [])
	
	async function renderFiles() {
		const newFiles = await getFilesInFolder()
		if (path.length > 0) {
			const filesInFolder = goToFolderByPath(path.join('/'), newFiles)
			setFiles(filesInFolder.currFiles);
			setPrevFiles(filesInFolder.currPrevFiles);
		} else {
			setFiles(newFiles ?? []);
		}
	}

	function goToFolderByPath(path: string, initialFiles?: ArrayType) {
		const splittedPath = path.split('/');
		const currPrevFiles: ArrayType[] = [[]];
		currPrevFiles.push(initialFiles ?? files);
		let currFiles = initialFiles ?? files;
		let currIndex = 0;
		while (true) {
			if (currIndex >= splittedPath.length) {
				currPrevFiles.pop();
				return {currFiles, currPrevFiles};
			}
			const currFolder = currFiles.find((obj) => obj.type === 'folder' && obj.name === splittedPath[currIndex])
			if (!!currFolder && currFolder.type === 'folder') {
				currFiles = currFolder.content;
				currIndex++;
				currPrevFiles.push(currFiles);
			} else {
				return {currFiles, currPrevFiles};
			}
		}
	}

	return (
		<>
			<div className={styles.buttons}>
				<div>
					<button className={styles.filter_button}>
						<img src='icons/filter_icon.svg' width={25} />
					</button>
					<button className={styles.search_button}>
						<img src='icons/search_icon.svg' width={20} />
					</button>
					<button className={styles.add_button} onClick = {() => (setFormModalOpen(true))}>
						<img src='icons/plus_icon.svg' width={15} />
						<span>Add</span>
					</button>
				</div>
			</div>
			<div>
				{prevFiles.length > 1 && (
					<button
						className={styles.back_icon}
						onClick={() => {
							setFiles(prevFiles[prevFiles.length - 1])
							const r = [...path]
							r.pop()
							setPath(r)
							const s = [...prevFiles]
							s.pop()
							setPrevFiles(s)
						}}
					>
						<img src="icons/back_icon.svg" width = {25}/>
					</button>
				)}
				<h4>{path.join(' -> ')}</h4>
				<div className={styles.files}>
					{files.map((file, index) => (
						<File
							onBlur={() => {setShowContext(false)}}
							key={index}
							file={file}
							onRightClick={(e) => {
								setContextPos({x: e.clientX, y: e.clientY});
								setShowContext(true);
								setContextOptions([{onClick: () => console.log('asd'), title: 'Delete'},
								{onClick: () => console.log('dsa'), title: 'Rename'}
							]);
							}}
							onDoubleClick={() => {
								if (file.type === 'folder') {
									setPrevFiles([...prevFiles, files])
									setFiles(file.content)
									setPath(prev => [...prev, file.name])
								}
							}}
							className={styles.file}
						/>
					))}
				</div>
			</div>
			<FormModal open = {formModalOpen} setOpen={setFormModalOpen}>
				<CreateFileForm turnOff={() => {setFormModalOpen(false)}} reloadFiles={renderFiles} currentPath={path.length > 0 ? path.join('/') : undefined} />
			</FormModal>
			<ContextMenu options={contextOptions} show={showContext} x={contextPos.x} y = {contextPos.y} />
		</>
	)
}

function File({
	file,
	onDoubleClick,
	onRightClick,
	onBlur,
	className,
}: {
	file: any
	onDoubleClick: React.MouseEventHandler<HTMLButtonElement>
	onRightClick: React.MouseEventHandler<HTMLButtonElement>
	onBlur: () => void;
	className?: string;
}) {
	const [focus, setFocus] = useState(false);
	function splitWord(word: string) {
		if (!word) return
		if (word.length > 7) return word.slice(0, 6) + '..'
		return word
	}
	return (
		<button
			onDoubleClick={e => {
				e.currentTarget.blur()
				onDoubleClick(e)
			}}
			onMouseDown={(e) => {
				if (e.button !== 2) return;
				onRightClick(e); 
			}}
			onFocus={(e) => {
				setFocus(true);
			}}
			onBlur={() => {
				setFocus(false);
				onBlur();
			}}
			className={`${className}`}
		>
			<img src={`icons/${file.type}_icon.svg`} width={50} />
			<span>{!focus ? splitWord(file.name) : file.name}</span>
		</button>
	)
}
