import { FC, ReactNode } from 'react';

import cn from 'classnames';

import { Smile } from '../../icons/Smile';
import { SmileSad } from '../../icons/SmileSad';
import { Typography } from '../Typography';

import styles from './FileStatus.module.css';

type Props = {
    type: 'success' | 'error';
    isActive: boolean;
    children: ReactNode;
};
export const FileStatus: FC<Props> = ({ type, isActive, children }) => {
    const dataTestId = type === 'success' ? 'file-status-success' : 'file-status-error';

    return (
        <span className={cn(styles.root, { [styles.active]: isActive })} data-testid={dataTestId}>
            <Typography>{children}</Typography>
            {type === 'success' ? <Smile size={40} /> : <SmileSad size={40} />}
        </span>
    );
}; 