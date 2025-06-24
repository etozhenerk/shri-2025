import { FC } from 'react';

import { Smile } from '@ui/icons/Smile';
import { SmileSad } from '@ui/icons/SmileSad';
import { Typography } from '@ui/Typography';
import cn from 'classnames';

import styles from './FileStatus.module.css';

type Props = {
    type: 'success' | 'error';
    isActive: boolean;
};
export const FileStatus: FC<Props> = ({ type, isActive }) => {
    const dataTestId = type === 'success' ? 'file-status-success' : 'file-status-error';

    return (
        <span className={cn(styles.root, { [styles.active]: isActive })} data-testid={dataTestId}>
            {type === 'success' ? (
                <>
                    <Typography>Обработан успешно</Typography>
                    <Smile size={40} />
                </>
            ) : (
                <>
                    <Typography>Не удалось обработать</Typography>
                    <SmileSad size={40} />
                </>
            )}
        </span>
    );
};
