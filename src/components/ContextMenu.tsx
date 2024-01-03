import { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.scss';

type OptionType = {
    title: string;
    onClick: () => void
}


export default ({options, show, x,y, setShow} : {options: OptionType[], show: boolean, x:number, y: number, setShow: (bool: boolean) => void}) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        window.addEventListener('click', (e) => {
            //@ts-ignore
            if (!ref.current?.contains(e.target)) {
                setShow(false);
            }
        })
    }, [])
    return (
        <div className={styles.wrapper} ref = {ref} style = {{top: y, left: x, display: show ? 'block' : 'none'}} >
            <ul>
                {options.map((option) => (
                    <li onClick = {async () => {await option.onClick(); setShow(false)}}>{option.title}</li>
                ))}
            </ul>
        </div>
    )
}