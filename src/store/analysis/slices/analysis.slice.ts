import { AnalysisState, IAnalysisSlice } from '@store/analysis/types';
import { StateCreator } from 'zustand';

type AnalysisSliceCreator = StateCreator<AnalysisState, [['zustand/devtools', never]], [], IAnalysisSlice>;

export const createAnalysisSlice: AnalysisSliceCreator = (set) => ({
    highlights: [],
    error: null,
    setHighlights: (highlights: IAnalysisSlice['highlights']) => set({ highlights }, false, 'analysis/setHighlights'),
    setError: (error: string | null) => set({ error, status: 'error' }, false, 'analysis/setError'),
});
