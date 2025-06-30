import { FC } from 'react';

import cn from 'classnames';

import { File } from '../../icons/File';
import { Trash } from '../../icons/Trash';
import { Button } from '../Button';
import { FileStatus } from '../FileStatus';
import { Typography } from '../Typography';

import styles from './HistoryItem.module.css';

type Props = {
    fileName: string;
    date: string;
    hasHighlights: boolean;
    onClick: () => void;
    onDelete: () => void;
};

export const HistoryItem: FC<Props> = ({ fileName, date, hasHighlights, onClick, onDelete }) => {
    const handleItemClick = () => {
        if (!hasHighlights) {
            return;
        }

        onClick();
    };

    return (
        <div className={styles.root} data-testid="history-item">
            <Button
                type="button"
                variant="secondary"
                className={cn(styles.item, { [styles.disabled]: !hasHighlights })}
                aria-label={`Открыть хайлайты для ${fileName}`}
                onClick={handleItemClick}
                data-testid="history-item-button"
            >
                <div className={styles.fileName}>
                    <File size={40} className={styles.icon} />
                    <Typography maxRowsNumber={1}>{fileName}</Typography>
                </div>
                <Typography>{date}</Typography>
                <FileStatus type="success" isActive={hasHighlights}>
                    Обработан успешно
                </FileStatus>
                <FileStatus type="error" isActive={!hasHighlights}>
                    Не удалось обработать
                </FileStatus>
            </Button>
            <Button
                type="button"
                variant="clear"
                className={styles.deleteButton}
                aria-label={`Удалить файл ${fileName}`}
                onClick={onDelete}
                data-testid="history-item-delete-button"
            >
                <Trash size={33} />
            </Button>
        </div>
    );
};
