import { useCallback } from 'react';

import { api } from '@api';
import { AnalysisHighlight } from '@app-types/analysis';
import { Highlights } from '@app-types/common';

interface CsvAnalysisParams {
    onData: (data: AnalysisHighlight[]) => void;
    onError: (error: Error) => void;
    onComplete: (highlights?: Highlights) => void;
}

export const useCsvAnalysis = ({ onData, onError, onComplete }: CsvAnalysisParams) => {
    const analyzeCsv = useCallback(
        (csv: File) => {
            api.analysis.analyzeCsv({
                csv,
                onData,
                onComplete,
                onError,
            });
        },
        [onData, onError, onComplete]
    );

    return { analyzeCsv };
};
