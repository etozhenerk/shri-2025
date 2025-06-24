import { FC } from 'react';

import { Button } from '@ui/Button';
import { Clear } from '@ui/icons/Clear';
import { Typography } from '@ui/Typography';
import cn from 'classnames';

import styles from './FileDisplay.module.css';

type Props = {
    fileName: string;
    isCompleted?: boolean;
    isProcessing?: boolean;
    onClear: () => void;
};

export const FileDisplay: FC<Props> = ({ fileName, onClear, isCompleted, isProcessing }) => {
    return (
        <div className={styles.fileControls}>
            <div className={styles.fileInfo}>
                <Typography
                    className={cn(styles.fileName, {
                        [styles.fileNameCompleted]: isCompleted,
                    })}
                    data-testid="dropzone-file-name"
                >
                    {fileName}
                </Typography>
            </div>
            <Button
                type="button"
                variant="clear"
                className={cn(styles.clearFileButton, styles.customBorder)}
                onClick={onClear}
                disabled={isProcessing}
                data-testid="dropzone-clear-button"
            >
                <Clear size={22} />
            </Button>
        </div>
    );
};
