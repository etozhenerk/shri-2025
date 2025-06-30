import { useEffect, useState } from 'react';

import { api } from '@api';
import { Button } from '@shri/ui-kit/components/Button';
import { Loader } from '@shri/ui-kit/components/Loader';
import { Typography } from '@shri/ui-kit/components/Typography';
import cn from 'classnames';

import styles from './GeneratePage.module.css';

export const GeneratePage = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            setError(null);

            const { blob, filename } = await api.report.generateReport();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setSuccessMessage('Отчёт успешно сгенерирован!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Неизвестная ошибка при попытке сгенерировать отчёт');
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timeout = setTimeout(() => {
            setSuccessMessage(null);
        }, 2000);

        return () => clearTimeout(timeout);
    }, [successMessage]);

    return (
        <div className={styles.container} data-testid="generate-page">
            <Typography as="h1" size="m" className={styles.title}>
                Сгенерируйте готовый csv-файл нажатием одной кнопки
            </Typography>

            <Button
                data-testid="generate-button"
                type="button"
                variant="primary"
                disabled={isGenerating}
                onClick={handleGenerate}
                className={cn(styles.generateButton, {
                    [styles.isGenerating]: isGenerating,
                })}
            >
                {isGenerating ? <Loader /> : 'Начать генерацию'}
            </Button>

            {successMessage && (
                <Typography as="p" size="s" data-testid="generate-success-message">
                    {successMessage}
                </Typography>
            )}
            {error && (
                <Typography as="p" size="s" color="error" data-testid="generate-error-message">
                    {error}
                </Typography>
            )}
        </div>
    );
};
