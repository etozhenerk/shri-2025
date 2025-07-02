import { PropsWithChildren } from 'react';

import cn from 'classnames';

import { WithClassName, WithTestId } from '../../types/common';

import styles from './Typography.module.css';

type Props = PropsWithChildren &
    WithClassName &
    WithTestId & {
        color?: 'dark' | 'light' | 'purple' | 'error';
        size?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl';
        as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        weight?: 'light' | 'regular' | 'medium' | 'bold' | 'extrabold';
        style?: 'normal' | 'italic';
        maxRowsNumber?: number;
        'aria-live'?: 'off' | 'polite' | 'assertive';
        'aria-label'?: string;
        'aria-labelledby'?: string;
        'aria-describedby'?: string;
    };

export const Typography = ({
    as: Component = 'p',
    size = 'm',
    weight = 'regular',
    style = 'normal',
    color = 'dark',
    children,
    maxRowsNumber,
    className,
    'data-testid': testId,
    'aria-live': ariaLive,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
}: Props) => {
    const lineClampStyle = maxRowsNumber
        ? {
              WebkitLineClamp: maxRowsNumber,
          }
        : {};

    return (
        <Component
            className={cn(
                className,
                styles[`text-size-${size}`],
                styles[`text-weight-${weight}`],
                styles[`text-style-${style}`],
                styles[`text-color-${color}`],
                { [styles.withLineClamp]: Boolean(maxRowsNumber) }
            )}
            style={{ ...lineClampStyle }}
            data-testid={testId}
            aria-live={ariaLive}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
        >
            {children}
        </Component>
    );
};
