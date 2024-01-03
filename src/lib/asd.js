
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

async function renameFile(path, type, newName) {
	const json = await getJSON();
	const files = json.files;
	const splittedPath = path.split('/');
  console.log(JSON.stringify(files, null, 2));
	let currFiles = files;
	let currIndex = 0;
	while (true) {
		if (currIndex >= splittedPath.length - 1) {
			const targetIndex = currFiles.findIndex((obj) => obj.name === splittedPath[currIndex] && obj.type === type);
			if (targetIndex === -1) return;
			currFiles[targetIndex].name = newName;
      console.log(JSON.stringify(files, null, 2));
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

renameFile('Folder1/Folder1.1', 'folder', 'Foldddd')
