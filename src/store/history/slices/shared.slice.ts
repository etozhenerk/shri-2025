import { HistoryState, ISharedSlice } from '@store/history/types';
import { StateCreator } from 'zustand';

type SharedSliceCreator = StateCreator<HistoryState, [['zustand/devtools', never]], [], ISharedSlice>;

export const createSharedSlice: SharedSliceCreator = (set) => ({
    reset: () =>
        set(
            {
                selectedItem: null,
                isOpenModal: false,
                history: [],
            },
            false,
            'shared/reset'
        ),
});
