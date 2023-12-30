import { useEffect, useState } from 'react'
import { ArrayType, getFilesInFolder } from '../../lib/SaveManager'
import styles from './dashboard.module.scss'

export default () => {
	const [prevFiles, setPrevFiles] = useState<ArrayType[]>([[]])
	const [files, setFiles] = useState<ArrayType>([])
	const [depth, setDepth] = useState(0)
	const [path, setPath] = useState<string[]>([])
	useEffect(() => {
		;(async () => {
			const newFiles = await getFilesInFolder()
			setFiles(newFiles ?? [])
		})()
	}, [])

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
					<button className={styles.add_button}>
						<img src='icons/plus_icon.svg' width={15} />
						<span>Add</span>
					</button>
				</div>
			</div>
			<div>
				<h4>{path.join(' -> ')}</h4>
				{depth > 0 && (
					<p
						onClick={() => {
							setFiles(prevFiles[prevFiles.length - 1])
							const r = [...path]
							r.pop()
							setPath(r)
							const s = [...prevFiles]
							s.pop()
							setPrevFiles(s)
							setDepth(depth - 1)
						}}
					>
						back
					</p>
				)}
				<div className={styles.files}>
					{files.map((file, index) => (
						<File
							key={index}
							file={file}
							onDoubleClick={() => {
								if (file.type === 'folder') {
									setPrevFiles([...prevFiles, files])
									setFiles(file.content)
									setPath(prev => [...prev, file.name])
									setDepth(depth + 1)
								}
							}}
							className={styles.file}
						/>
					))}
				</div>
			</div>
		</>
	)
}

function File({
	file,
	onDoubleClick,
	className,
}: {
	file: any
	onDoubleClick: React.MouseEventHandler<HTMLButtonElement>
	className?: string
}) {
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
			className={`${className}`}
		>
			<img src={`icons/${file.type}_icon.svg`} width={50} />
			<span>{splitWord(file.name)}</span>
		</button>
	)
}
