import { FC, PropsWithChildren, ButtonHTMLAttributes } from 'react';

import cn from 'classnames';

import { Loader } from '../Loader';
import { WithTestId } from '../types/common';

import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'download' | 'upload' | 'clear';

type Props = PropsWithChildren &
    ButtonHTMLAttributes<HTMLButtonElement> &
    WithTestId & {
        variant?: Variant;
        fullWidth?: boolean;
        isLoading?: boolean;
    };

export const Button: FC<Props> = ({
    variant = 'primary',
    children,
    fullWidth = false,
    className = '',
    disabled = false,
    isLoading = false,
    'data-testid': testId,
    ...rest
}) => {
    return (
        <button
            className={cn(
                styles.button,
                styles[variant],
                {
                    [styles.fullWidth]: fullWidth,
                    [styles.disabled]: disabled || isLoading,
                },
                className
            )}
            disabled={disabled || isLoading}
            data-testid={testId || 'ui-button'}
            {...rest}
        >
            {isLoading ? <Loader size={20} /> : children}
        </button>
    );
};
