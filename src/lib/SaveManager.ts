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
	await createSaveFileIfNecessary();
}

async function createDirIfNecessary() {
	const appDataDirPath = await appDataDir()
	const isExist = await exists(appDataDirPath)
	if (isExist) return
	await createDir(appDataDirPath)
}

async function deleteFile(path: string, type: 'folder' | 'file') {
	const splittedPath = path.split('/');
	const json = await getJSON();
	const files = json.files;
	let currFiles = files;
	let currIndex = 0;
	while (true) {
		if (currIndex >= splittedPath.length - 1) {
			const indexFileToDelete = currFiles.findIndex((obj) => obj.type === type && obj.name === splittedPath[splittedPath.length - 1]);
			currFiles.splice(indexFileToDelete, 1);
			await WriteJSON({files: files});
			return files;
		}
		const currFolder = currFiles.find((obj) => obj.name === splittedPath[currIndex] && obj.type === 'folder')
		if (!!currFolder && currFolder.type === 'folder') {
			currFiles = currFolder.content;
			currIndex++;
		} else {
			return files;
		}
	}
}

async function renameFile(path: string, type: 'folder' | 'file', newName: string) {
	const json = await getJSON();
	const files = json.files;
	const splittedPath = path.split('/');
	let currFiles = files;
	let currIndex = 0;
	while (true) {
		if (currIndex >= splittedPath.length - 1) {
			const targetIndex = currFiles.findIndex((obj) => obj.name === splittedPath[currIndex] && obj.type === type);
			if (targetIndex === -1) return;
			currFiles[targetIndex].name = newName;
			await WriteJSON({files});
		}
		const newFiles = currFiles.find((obj) => obj.name === splittedPath[currIndex] && obj.type === 'folder');
		if (newFiles && newFiles.type === 'folder') {
			currFiles = newFiles.content;
			currIndex++;
		} else {
			return;
		}
	}
}


function removeByIndex(array: Array<any>, index: number) {
	if (index < 0 || index >= array.length) {
	  return array;
	}
	array.splice(index, 1);
	  return array
  }

async function createSaveFileIfNecessary() {
	const isExist = await exists('save00.json', {dir: BaseDirectory.AppData});
	if (isExist) return
	await createSaveFile();
}

async function createSaveFile() {
	await writeTextFile('save00.json', JSON.stringify({files: []}), {dir: BaseDirectory.AppData});
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
	body: {[key:string]: any}
}

async function WriteJSON(json: SaveFileType) {
	await writeTextFile('save00.json', JSON.stringify(json, null, 2), {
		dir: BaseDirectory.AppData,
	})
}

async function createFolder(path: string) {
	const json = { ...(await getJSON())}
	const splittedPath = path.split('/');
	const newJSON = PasteFileIntoJSON(splittedPath,json.files);
	await WriteJSON({files: newJSON});
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
		body: body ?? null,
	})
	await WriteJSON({ files: newJSON })
}

function PasteFileIntoJSON(
	path: string[],
	files: ArrayType,
	file?: FileContentType
) {
	function IterateFolders(files: ArrayType, pathIndex: number) {
		if (pathIndex > path.length - 1) {
			if (!file) return;
			const fileAlreadyExist =
				files.findIndex(
					obj => obj.type === 'file' && obj.name === file.name
				)
			if (fileAlreadyExist !== -1) {
				files[fileAlreadyExist].content = file;
				return;
			}
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

export { Init, getFilesInFolder, getJSON, saveFile, createFolder, deleteFile, renameFile };
export type { ArrayType }
