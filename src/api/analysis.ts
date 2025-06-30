import { AnalysisHighlight } from '@app-types/analysis';
import { Highlights } from '@app-types/common';
import { InvalidServerResponseError, transformAnalysisData } from '@utils/analysis';

import client from './client';

const DEFAULT_ROWS = 10000;

interface AnalyzeCsvParams {
    csv: File;
    onData: (data: AnalysisHighlight[]) => void;
    onComplete: (highlights?: Highlights) => void;
    onError: (error: Error) => void;
}

export const analyzeCsv = async ({ csv, onData, onComplete, onError }: AnalyzeCsvParams): Promise<void> => {
    try {
        const formData = new FormData();
        formData.append('file', csv);

        const response = await client.post(`/aggregate?rows=${DEFAULT_ROWS}`, {
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = errorData.error || errorData.message;
            throw new Error(errorMessage || 'Неизвестная ошибка при попытке обработать файл :(');
        }

        if (!response.body) {
            throw new Error('Неизвестная ошибка при попытке обработать файл :(');
        }

        const reader = response.body.getReader();
        let isDone = false;
        let finalHighlights: Highlights | undefined = undefined;

        while (!isDone) {
            const { done, value } = await reader.read();
            isDone = done;

            if (value) {
                try {
                    const { highlightsToStore, highlights } = transformAnalysisData(value);
                    finalHighlights = highlights;
                    onData(highlightsToStore);
                } catch (error) {
                    if (error instanceof InvalidServerResponseError) {
                        throw error;
                    }
                    throw new Error('Неизвестная ошибка парсинга :(');
                }
            }
        }
        onComplete(finalHighlights);
    } catch (error) {
        onError(error as Error);
    }
};
