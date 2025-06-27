import { FC } from 'react';

import { AnalysisHighlight } from '@app-types/analysis';
import { Modal } from '@shri/ui-kit';
import { useHistoryStore } from '@store/historyStore';
import { convertHighlightsToArray } from '@utils/analysis';
import { useShallow } from 'zustand/react/shallow';

import { HighlightCard } from '../HighlightCard';

import styles from './HistoryModal.module.css';

export const HistoryModal: FC = () => {
    const { isOpenModal, selectedItem, hideModal } = useHistoryStore(
        useShallow((state) => ({
            isOpenModal: state.isOpenModal,
            selectedItem: state.selectedItem,
            hideModal: state.hideModal,
        }))
    );

    if (!selectedItem?.highlights || !isOpenModal) {
        return null;
    }

    const hightlights: AnalysisHighlight[] = convertHighlightsToArray(selectedItem.highlights);

    return (
        <Modal isOpen={isOpenModal} onClose={hideModal} data-testid="history-modal">
            <div className={styles.root}>
                <div className={styles.highlights}>
                    {hightlights.map((highlight) => (
                        <HighlightCard key={highlight.title} highlight={highlight} className={styles.hightlightCard} />
                    ))}
                </div>
            </div>
        </Modal>
    );
};
