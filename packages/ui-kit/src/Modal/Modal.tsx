import React, { FC, PropsWithChildren } from 'react';

import cn from 'classnames';

import { Button } from '../Button';
import { Cross } from '../icons/Cross';
import { Portal } from '../Portal';
import { WithTestId } from '../types/common';

import styles from './Modal.module.css';

type Props = PropsWithChildren & WithTestId & {
    isOpen: boolean;
    onClose?: () => void;
}

export const Modal: FC<Props> = ({ isOpen, children, onClose, 'data-testid': testId }) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Portal>
            <div
                className={cn(styles.backdrop, {
                    [styles.backdropShown]: isOpen,
                })}
                onClick={handleBackdropClick}
                data-testid="modal-backdrop"
            >
                <div className={styles.modal} onClick={handleModalClick} data-testid={testId ? `${testId}` : 'modal'}>
                    {onClose && (
                        <Button
                            variant="clear"
                            className={styles.closeButton}
                            onClick={onClose}
                            data-testid="modal-close-button"
                        >
                            <Cross size={32} />
                        </Button>
                    )}
                    {children}
                </div>
            </div>
        </Portal>
    );
};
