import { FC } from 'react';

import cn from 'classnames';

import { WithClassName } from '../../types/common';
import { Typography } from '../Typography';

import styles from './HighlightCard.module.css';

type Props = WithClassName & {
    title: string;
    description: string;
};

export const HighlightCard: FC<Props> = ({ title, description, className }) => {
    return (
        <div className={cn(styles.highlightCard, className)} data-testid="highlight-card">
            <Typography size="xl" weight="medium">
                {title}
            </Typography>
            <Typography size="xs">{description}</Typography>
        </div>
    );
};
