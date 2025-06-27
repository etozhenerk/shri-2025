import { FC } from 'react';

import { AnalysisHighlight } from '@app-types/analysis';
import { WithClassName, Typography } from '@shri/ui-kit';
import cn from 'classnames';

import styles from './HighlightCard.module.css';

type Props = WithClassName & {
    highlight: AnalysisHighlight;
};

export const HighlightCard: FC<Props> = ({ highlight, className }) => {
    return (
        <div className={cn(styles.highlightCard, className)} data-testid="highlight-card">
            <Typography size="xl" weight="medium">
                {highlight.title}
            </Typography>
            <Typography size="xs">{highlight.description}</Typography>
        </div>
    );
};
