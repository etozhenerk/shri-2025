import { logger } from '@store/middlewares/logger';
import { StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { historyPersistConfig } from './persist.config';
import { HistoryState } from './types';

export const withMiddlewares = (config: StateCreator<HistoryState>) => {
    return logger(devtools(persist(config, historyPersistConfig), { name: 'HistoryStore' }), 'HistoryStore');
};
