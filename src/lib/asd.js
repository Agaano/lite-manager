
async function getJSON() {
    return {
        "files": [
          {
            "type": "file",
            "name": "File1",
            "content": {
              "name": "File1",
              "uri": ""
            }
          },
          {
            "type": "folder",
            "name": "Folder1",
            "content": [
              {
                "type": "folder",
                "name": "Folder1.1",
                "content": [
                  {
                    "type": "folder",
                    "name": "Folder1.1.1",
                    "content": []
                  },
                  {
                    "type": "folder",
                    "name": "File1.1.1",
                    "content": []
                  },
                  {
                    "type": "file",
                    "name": "File1.1.1",
                    "content": {
                      "name": "File1.1.1",
                      "uri": "Folder1/Folder1.1"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
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

deleteFile('Folder1', '')
