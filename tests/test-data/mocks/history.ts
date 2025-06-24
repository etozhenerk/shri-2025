import { successAnalysisMock } from './analysis-success';

export const historyMock = [
    {
        id: '1',
        fileName: 'test-data-1.csv',
        timestamp: Date.now(),
        highlights: successAnalysisMock,
    },
    {
        id: '2',
        fileName: 'test-data-2.csv',
        timestamp: Date.now() - 10000,
        highlights: null, // Элемент с ошибкой
    },
]; 