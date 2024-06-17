import { useEffect, useState } from 'react'
import Select from 'react-dropdown-select'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store.ts'
import styles from './fileEditor.module.scss'
import useModal from '../../hooks/useModal.tsx'
import { saveFile } from '../../lib/SaveManager.ts'
import axios, { AxiosHeaders } from 'axios'
import { invoke } from '@tauri-apps/api/tauri'
import beautify from 'js-beautify'
import { current } from '@reduxjs/toolkit'
import { TailSpin } from 'react-loader-spinner'

export type HTTPQueryMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export default () => {
	const { body } = useSelector((state: RootState) => state.router)
	const queryData = body?.file?.content?.body ?? {};
	const [pageState, setPageState] = useState<'Visual' | 'JSON'>('Visual')

	const [queryBody, setQueryBody] = useState(queryData.body ?? {})

	const [fileSaved, setFileSaved] = useState(false);
 
	const [responses, setResponses] = useState([]);

	const [queryMethod, setQueryMethod] = useState<HTTPQueryMethod>(queryData.method ?? 'GET')
	const [headers, setHeaders] = useState(queryData.headers ?? {})
	const [uri, setUri] = useState(queryData.uri ?? '')

	const HeadersModal = useModal();
	const [headersModalIsOpen, setHeadersModalIsOpen] = useState(false);


	const BodyModal = useModal();
	const [bodyModalIsOpen, setBodyModalIsOpen] = useState(false);

	const ResponseViewerModal = useModal();
	const [responseViewerModalIsOpen, setResponseViewerModalIsOpen] = useState(false);
	const [currentResponse, setCurrentResponse] = useState<{[key:string]: any}>({});


	const [loading, setLoading] = useState(false);


	const queryMethods: {value: HTTPQueryMethod, label: HTTPQueryMethod}[] = [
		{
			value: 'GET',
			label: 'GET',
		},
		{
			value: 'POST',
			label: 'POST'
		},
		{
			value: 'PUT',
			label: 'PUT',
		},
		{
			value: 'PATCH',
			label: 'PATCH',
		},
		{
			value: 'DELETE',
			label: 'DELETE',
		}
	]
	
	const GetJSON = () => {
		return ({
			uri: uri,
			method: queryMethod,
			body: queryBody,
			headers: headers
		})
	}

	const handleSave = async () => {
		const json = GetJSON();
		await saveFile(body.file.content.name, body.file.content.uri, json)
		setFileSavedTimer();
	}

	function getCurrentDateTime() {
		let currentDate = new Date();
	
		let day: any = currentDate.getDate();
		let month: any = currentDate.getMonth() + 1; // Месяцы в JavaScript начинаются с 0
		let year: any = currentDate.getFullYear();
		let hours: any = currentDate.getHours();
		let minutes: any = currentDate.getMinutes();
	
		// Дополнение чисел нулями, если нужно
		if (day < 10) {
			day = '0' + day;
		}
		if (month < 10) {
			month = '0' + month;
		}
		if (hours < 10) {
			hours = '0' + hours;
		}
		if (minutes < 10) {
			minutes = '0' + minutes;
		}
	
		// Возвращаем строку в нужном формате
		return day + '.' + month + '.' + year + ' ' + hours + ':' + minutes;
	}

	const setFileSavedTimer = () => {
		setFileSaved(prev => true)
		setTimeout(() => {
			setFileSaved(prev => false)
		}, 5000)
	}
	


	const handleSendQuery = async () => {
		const queryJSON = GetJSON();
		console.log('TRYING TO SEND QUERY');
		if (!queryJSON.uri || !queryJSON.method) return;
		setLoading(true);
		let response = await invoke('make_request', {
			url: queryJSON.uri,
			method: queryJSON.method, 
			headersJson: JSON.stringify(queryJSON.headers), 
			bodyJson: JSON.stringify(queryJSON.body)
		})
		response['date'] = getCurrentDateTime();
		response['name'] = body.name;
		setResponses((prev) => ([...prev, response]))
		setLoading(false);
	}

	return (
		<>
			<div className={styles.main}>
				<div className={styles.pageOptions}>
					<h3 className={pageState === 'Visual' ? styles.activePage : ''}>
						Visual
					</h3>
					<h3 className={pageState === 'JSON' ? styles.activePage : ''}>
						JSON
					</h3>
				</div>
				<input
					className={styles.uri_input}
					value = {uri}
					onChange={(e) => {setUri(e.target.value)}}
					placeholder='Enter request URL here...'
				/>
				<div className={styles.optionsBlock}>
					<div className={styles.options}>
						<div className={styles.option_field}>
							<label>Method:</label>
							<Select 
								style = {{minWidth: '100px'}}
								options={queryMethods} 
								values = {[{value: queryMethod, label: queryMethod}]} 
								onChange={(e) => {setQueryMethod(e[0].value)} }
							/>
						</div>
						<div className={styles.option_field}>
							<label>Allow cookies:</label>
							<input id = "allow-cookies" type = "checkbox"/>
							<label htmlFor='allow-cookies'></label>
						</div>
						<div className={styles.option_field}>
							<label htmlFor='headers-button'>Headers:</label>
							<button 
								className={styles.options_button} 
								onClick = {() => {setHeadersModalIsOpen(true)}} 
								id = 'headers-button' 
								type='button'
							>
								Open
							</button>
						</div>
					</div>
					<div className={styles.bodyBlock}>
						<table className={styles.body}>
							<thead>
								<tr>
									<th colSpan={2}>
										Body
									</th>
								</tr>
								<tr>
									<th>
										Key
									</th>
									<th>
										Value
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries<any>(queryBody).splice(0, 2).map(([key,value]) => (
									<tr>
										<td>{key}</td>
										<td>{value}</td>
									</tr>
								))}
								<tr>
									<td className={styles.tdButton} onClick = {() => {setBodyModalIsOpen(true)}} colSpan={2}>
										Show full table
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
				<div className={styles.responsesBlock}>
					<h1>Responses:</h1>
					<div className={styles.responsesArea}>
						{responses.length > 0 ? responses.map((response) => (
							<p style = {{cursor: 'pointer'}} onClick = {() => {
								setResponseViewerModalIsOpen(true);
								setCurrentResponse(response);
							}}>{response.date} | {response.name}: Status code {response.status} | Click for more details</p>
						)): <p style = {{color: '#888888', textAlign: 'center', paddingTop: '5px'}}>Click SEND button to get response</p>}
					</div>
				</div>
				<div className={styles.buttonsBlock}>
					<button onClick={handleSave} >{fileSaved ? "Saved :)" : "Save"}</button>
					<button disabled = {loading} onClick ={handleSendQuery}>{loading ? <TailSpin width={30} color='#ff8c8c' height={30}/> : 'Send'}</button>
				</div>
			</div>
			<HeadersModal 
				open = {headersModalIsOpen}
				setOpen={setHeadersModalIsOpen}
			>
				<HeadersTable styles={styles} headers={headers} setHeaders={setHeaders}/>
			</HeadersModal>
			<BodyModal
				open={bodyModalIsOpen}
				setOpen={setBodyModalIsOpen}
			>
				<HeadersTable styles={styles} headers={queryBody} setHeaders={setQueryBody}/>
			</BodyModal>
			<ResponseViewerModal
				open={responseViewerModalIsOpen}
				setOpen={setResponseViewerModalIsOpen}
			>
				{ !!currentResponse ? 
					<div className={styles.response_viewer}>
						<h1>Response name: {currentResponse?.name}</h1>
						<h2>Status: {currentResponse?.status}</h2>
						<h2>Headers:</h2>
						<p style = {{color: '#cccccc', padding: '10px'}}>{JSON.stringify(currentResponse?.headers, null, 4)}</p>
						<h2>Body:</h2>
						<p>{beautify.html(currentResponse?.body)}</p>
					</div>
				: <TailSpin color='#ff8c8c'/>}
			</ResponseViewerModal>
		</>
	)
}


const HeadersTable = ({styles, headers, setHeaders} : {styles: any, headers: {[key: string]: any}, setHeaders: (arg: {[key: string]: any}) => void}) => {
	const [key, setKey] = useState('')
	const [value, setValue] = useState('')

	const handleAddNewHeader = () => {
		if (key.length === 0 || value.length === 0) return;
		setHeaders((prev) => ({...prev, [key]: value}))
		setKey('')
		setValue('')
	}

	function removeField(key) {
		setHeaders((prev) => {
			const obj = {...prev}
			if (obj.hasOwnProperty(key))
				delete obj[key]
			return obj;
		})
	}

	return (
		<div className={styles.headersWrapper}>
			<table className={styles.headersTable}> 
				<thead>
					<tr>
						<th>Key</th>
						<th>Value</th>
						<th>X</th>
					</tr>
				</thead>
				<tbody>
					{Object.entries<any>(headers).map(([key, value]) => (
						<tr>
							<td>{key}</td>
							<td>{value}</td>
							<td className={styles.tdButton} onClick={() => {removeField(key)}} style = {{textAlign: 'center'}}>X</td>
						</tr>
					))}
					<tr>
						<td>
							<input placeholder='Enter new key' value = {key} onChange={(e) => {setKey(e.target.value)}}/>
						</td>
						<td>
							<input placeholder='Enter new value' value = {value} onChange = {(e) => {setValue(e.target.value)}}/>
						</td>
						<td/>
					</tr>
					<tr>
						<td className={styles.tdButton} onClick = {handleAddNewHeader} colSpan={3}>+ Add record</td>
					</tr>
					<tr>
						<td className={styles.tdButton} colSpan={3}>Close</td>
					</tr>
				</tbody>
			</table>
		</div>
	)
}