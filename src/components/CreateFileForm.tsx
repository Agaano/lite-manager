import { useEffect, useState } from 'react';
import styles from './CreateFileFolder.module.scss';
import { createFolder, saveFile } from '../lib/SaveManager';

type formDataType = {
    [key: string]: any
}

export default ({turnOff, reloadFiles, currentPath} : {currentPath?: string; turnOff: () => void; reloadFiles: () => Promise<void>}) => {
    const [formData, setFormData] = useState<formDataType>(currentPath ? {} : {path: currentPath});
    const [message,setMessage] = useState('');

    useEffect(() => {
        SetFormKey('path', currentPath);
    }, [currentPath])

    function SetFormKey(key: string, value: any) {
        setFormData(prev => {
            return {...prev, [key]: value}
        })
    }
    function onChange(e:React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) {
        SetFormKey(e.target.name, e.target.value);
    }

    async function handleSubmit(e:React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const keys = Object.keys(formData);
        if (!keys.includes('type') || !keys.includes('name') || formData['type'].length < 0) {
            setMessage('Enter all fields...');
            return;
        }
        if (formData['type'] === 'file') 
            await saveFile(formData['name'], formData['path']);
        else if (formData['type'] === 'folder' && !!formData['path'])
            await createFolder(`${formData['path']}/${formData['name']}`)
        else if (formData['type'] === 'folder' && !formData['path'])
            await createFolder(formData['name']);
        await reloadFiles();
        turnOff()

    }
    
    return (
        <form onSubmit={handleSubmit}>
            <h1>Create...</h1>
            <p>{message}</p>
            <div className = {styles.form_group}>
                <label>Type:</label>
                <select name = 'type' value = {formData.type} onChange = {onChange} defaultValue={'-'}>
                    <option value = '' hidden selected>Choose type</option>
                    <option value = 'file'>File</option>
                    <option value = 'folder'>Folder</option>
                </select>
            </div>
            <div className={styles.form_group}>
                <label>Name:</label>
                <input name = 'name' autoComplete='off' onChange={onChange} value = {formData.name}/>
            </div>
            <div className={styles.form_group}>
                <label>Path:</label>
                <input name = 'path' autoComplete='off' onChange={onChange} value = {formData.path}/>
            </div>
            <button className = {styles.button}>CREATE</button>
        </form>
    )
}