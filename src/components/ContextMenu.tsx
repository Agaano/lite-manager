import { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.scss';

type OptionType = {
    title: string;
    onClick: () => void
}


export default ({options, show, x,y} : {options: OptionType[], show: boolean, x:number, y: number}) => {
    return (
        <div className={styles.wrapper} style = {{top: y, left: x, display: show ? 'block' : 'none'}} >
            <ul>
                {options.map((option) => (
                    <li onClick = {() => {option.onClick; show = false}}>{option.title}</li>
                ))}
            </ul>
        </div>
    )
}