import React, { FC, PropsWithChildren, useEffect, useId } from 'react';

import cn from 'classnames';

import { Cross } from '../../icons/Cross';
import { WithTestId } from '../../types/common';
import { Button } from '../Button';
import { Portal } from '../Portal';

import styles from './Modal.module.css';

type Props = PropsWithChildren & WithTestId & {
    isOpen: boolean;
    onClose?: () => void;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
    title?: string;
}

export const Modal: FC<Props> = ({ 
    isOpen, 
    children, 
    onClose, 
    'data-testid': testId,
    ariaLabelledBy,
    ariaDescribedBy,
    title
}) => {
    const titleId = useId();
    const descriptionId = useId();
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose?.();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            if (onClose) {
                onClose();
            }
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Portal>
            <div
                className={cn(styles.backdrop, {
                    [styles.backdropShown]: isOpen,
                })}
                onClick={handleBackdropClick}
                onKeyDown={handleBackdropKeyDown}
                data-testid="modal-backdrop"
                role="presentation"
            >
                <div
                    className={styles.modal}
                    data-testid={testId ? `${testId}` : 'modal'}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={ariaLabelledBy || titleId}
                    aria-describedby={ariaDescribedBy || descriptionId}
                >
                    {onClose && (
                        <Button
                            variant="clear"
                            className={styles.closeButton}
                            onClick={onClose}
                            data-testid="modal-close-button"
                            aria-label="Закрыть"
                        >
                            <Cross size={32} />
                        </Button>
                    )}
                    {title && <div id={titleId} className="visually-hidden">{title}</div>}
                    {children}
                </div>
            </div>
        </Portal>
    );
};
