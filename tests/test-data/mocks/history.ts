import { successAnalysisMock } from './analysis-success';

export const historyMock = [
    {
        id: '1',
        fileName: 'test-data-1.csv',
        timestamp: 1672531200000, // 2023-01-01T00:00:00Z
        highlights: successAnalysisMock,
    },
    {
        id: '2',
        fileName: 'test-data-2.csv',
        timestamp: 1672617600000, // 2023-01-02T00:00:00Z
        highlights: null, // Элемент с ошибкой
    },
]; 