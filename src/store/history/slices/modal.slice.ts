import { HistoryState, IModalSlice } from '@store/history/types';
import { StateCreator } from 'zustand';

type ModalSliceCreator = StateCreator<HistoryState, [['zustand/devtools', never]], [], IModalSlice>;

export const createModalSlice: ModalSliceCreator = (set) => ({
    isOpenModal: false,
    showModal: () => set({ isOpenModal: true }, false, 'modal/showModal'),
    hideModal: () => set({ isOpenModal: false }, false, 'modal/hideModal'),
});
