import { useRef } from 'react'
import './modal.scss'

export default () => {

    return ({open, children, setOpen} : {open: boolean; children: React.ReactNode, setOpen: (bool: boolean) => any}) => {
        const modalRef = useRef<HTMLDivElement>(null);
        
        return (
            <div onClick = {(e) => {
                //@ts-ignore
                if (!modalRef.current?.contains(e.target))
                    setOpen(false);
            }} className = {`modal-window-wrapper ${open ? 'open' : ''}`}>
                <div ref = {modalRef} className='modal-window-content'>
                    {children}
                </div>
            </div>
        )}
}