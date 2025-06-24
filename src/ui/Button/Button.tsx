import { ButtonHTMLAttributes, FC, PropsWithChildren } from 'react';

import { WithTestId } from '@app-types/testing';
import cn from 'classnames';

import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'download' | 'upload' | 'clear';

type Props = PropsWithChildren & ButtonHTMLAttributes<HTMLButtonElement> & WithTestId & {
    variant?: Variant;
    fullWidth?: boolean;
};

export const Button: FC<Props> = ({
    variant = 'primary',
    children,
    fullWidth = false,
    className = '',
    disabled = false,
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
                    [styles.disabled]: disabled,
                },
                className
            )}
            disabled={disabled}
            data-testid={testId}
            {...rest}
        >
            {children}
        </button>
    );
};
