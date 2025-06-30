import client from './client';

const DEFAULT_SIZE = 0.01;

export const generateReport = async (size: number = DEFAULT_SIZE): Promise<{ blob: Blob; filename: string }> => {
    const response = await client.get(`/report?size=${size}`);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
            errorData.error
                ? `Произошла ошибка: ${errorData.error}`
                : 'Неизвестная ошибка при попытке сгенерировать отчёт'
        );
    }

    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'report.csv';

    const blob = await response.blob();

    return { blob, filename };
}; 