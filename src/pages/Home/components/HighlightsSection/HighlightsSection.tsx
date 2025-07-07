import { FC } from 'react';

import { AnalysisHighlight } from '@app-types/analysis';
import { HighlightCard } from '@shri/ui-kit/components/HighlightCard';
import { Typography } from '@shri/ui-kit/components/Typography';

import styles from './HighlightsSection.module.css';

type Props = {
    highlights: AnalysisHighlight[];
};

/**
 * Компонент секции с хайлайтами результатов обработки
 *
 * @param {IHighlight[]} highlights - Список хайлайтов
 * @returns {JSX.Element}
 */
export const HighlightsSection: FC<Props> = ({ highlights }) => {
    if (highlights.length === 0) {
        return (
            <Typography size="l" className={styles.highlightsPlaceholder} data-testid="highlights-placeholder">
                Здесь появятся хайлайты
            </Typography>
        );
    }

    return (
        <div className={styles.highlightsGrid} data-testid="highlights-grid">
            {highlights.map((highlight: AnalysisHighlight) => (
                <HighlightCard key={highlight.title} title={highlight.title} description={highlight.description} />
            ))}
        </div>
    );
}; 