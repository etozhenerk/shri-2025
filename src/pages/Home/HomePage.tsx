import { useCallback } from 'react';

import { Highlights } from '@app-types/common';
import { useCsvAnalysis } from '@hooks/use-csv-analysis';
import { Typography } from '@shri/ui-kit/components/Typography';
import { useAnalysisStore } from '@store/analysisStore';
import { addToHistory } from '@utils/storage';
import { useShallow } from 'zustand/react/shallow';

import { FileUploadSection } from './components/FileUploadSection';
import { HighlightsSection } from './components/HighlightsSection';
import styles from './HomePage.module.css';

/**
 * @description
 * Главная страница приложения для обработки CSV файлов
 *
 * @returns {JSX.Element}
 * @constructor
 */
export const HomePage = () => {
    const { file, status, highlights, error, setFile, setStatus, setHighlights, reset, setError } = useAnalysisStore(
        useShallow((state) => ({
            file: state.file,
            status: state.status,
            highlights: state.highlights,
            error: state.error,
            setFile: state.setFile,
            setStatus: state.setStatus,
            setHighlights: state.setHighlights,
            reset: state.reset,
            setError: state.setError,
        }))
    );

    const onComplete = useCallback((highlights?: Highlights) => {
        setStatus('completed');

        if (file) {
            addToHistory({ fileName: file.name, highlights });
        }
    }, [file, setStatus]);

    const onError = useCallback((error: Error) => {
        setError(error.message);

        if (file) {
            addToHistory({ fileName: file.name });
        }
    }, [file, setError]);

    const { analyzeCsv } = useCsvAnalysis({
        onData: setHighlights,
        onComplete,
        onError,
    });

    const handleFileSelect = useCallback((selectedFile: File) => {
        setFile(selectedFile);
    }, [setFile]);

    const handleSend = useCallback(async () => {
        if (!file || status === 'processing') {
            return;
        }

        setStatus('processing');
        await analyzeCsv(file);
    }, [file, status, setStatus, analyzeCsv]);

    return (
        <section className={styles.container} data-testid="home-page">
            <Typography as="h1" size="m" className={styles.title}>
                Загрузите <b>csv</b> файл и <b>получите полную</b> информацию о нём за сверхнизкое время
            </Typography>
            <section>
                <h2 className="visually-hidden">Загрузка и анализ файла</h2>
                <FileUploadSection
                    file={file}
                    status={status}
                    error={error}
                    onFileSelect={handleFileSelect}
                    onSend={handleSend}
                    onClear={reset}
                />
            </section>
            <section>
                <h2 className="visually-hidden">Результаты анализа</h2>
                <HighlightsSection highlights={highlights} />
            </section>
        </section>
    );
};
