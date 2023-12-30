import {
	BaseDirectory,
	createDir,
	exists,
	readTextFile,
	writeTextFile,
} from '@tauri-apps/api/fs'
import { appDataDir } from '@tauri-apps/api/path'
async function Init() {
	await createDirIfNecessary()
	const json = await getJSON()
	console.log(json)
}

async function createDirIfNecessary() {
	const appDataDirPath = await appDataDir()
	const isExist = await exists(appDataDirPath)
	if (isExist) return
	await createDir(appDataDirPath)
}

async function getJSON(): Promise<SaveFileType> {
	const filesString = await readTextFile('save00.json', {
		dir: BaseDirectory.AppData,
	})
	const filesJSON = JSON.parse(filesString)
	return filesJSON
}

async function getFilesInFolder(path?: string) {
	const json = await getJSON()
	if (!path) {
		return json.files
	}
	const arrPath = path.split('/')
	function IterateFolders(files: ArrayType, pathIndex: number) {
		if (pathIndex > arrPath.length - 1) {
			return files
		}
		const thisCell = files.find(
			obj => obj.type === 'folder' && obj.name === arrPath[pathIndex]
		)
		if (!thisCell || thisCell.type === 'file') return
		return IterateFolders(thisCell.content, pathIndex + 1)
	}
	return IterateFolders(json.files, 0)
}

type SaveFileType = {
	files: ArrayType
}
type ArrayType = Array<FolderType | FileType>
type FolderType = { type: 'folder'; name: string; content: ArrayType }
type FileType = { type: 'file'; name: string; content: FileContentType }
type FileContentType = {
	name: string
	uri: string
}

async function WriteJSON(json: SaveFileType) {
	await writeTextFile('save00.json', JSON.stringify(json, null, 2), {
		dir: BaseDirectory.AppData,
	})
}

async function saveFile(
	filename: string,
	filepath?: string,
	body?: { [key: string]: any }
) {
	const json = { ...(await getJSON()) }
	const path = filepath?.split('/') ?? []
	const newJSON = PasteFileIntoJSON(path, json.files, {
		name: filename,
		uri: filepath ?? '',
	})
	await WriteJSON({ files: newJSON })
	// let alreadyExist = json.files.reduce(
	// 	(acc, obj) =>
	// 		acc || (obj.type === 'file' && obj.content?.name === filename),
	// 	false
	// )
	// if (alreadyExist) return 0
	// json.files.push({
	// 	type: 'file',
	// 	name: filename,
	// 	content: { name: filename, uri: filepath ?? '' },
	// })
	// await WriteJSON(json)
}

function PasteFileIntoJSON(
	path: string[],
	files: ArrayType,
	file: FileContentType
) {
	function IterateFolders(files: ArrayType, pathIndex: number) {
		if (pathIndex > path.length - 1) {
			const fileAlreadyExist =
				files.findIndex(
					obj => obj.type === 'file' && obj.name === file.name
				) === -1
					? false
					: true
			if (fileAlreadyExist) return
			files.push({ type: 'file', name: file.name, content: file })
			return
		}
		var foldername = path[pathIndex]
		if (foldername.length === 0) return
		var index = files.findIndex(function (obj) {
			return obj.type === 'folder' && obj.name === foldername
		})
		if (index === -1) {
			index = files.length
			files.push({ type: 'folder', name: foldername, content: [] })
		}
		//@ts-ignore
		return IterateFolders(files[index].content, pathIndex + 1)
	}
	IterateFolders(files, 0)
	return files
}

export { Init, getFilesInFolder, getJSON, saveFile }
export type { ArrayType }
