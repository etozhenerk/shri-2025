import { useEffect } from 'react';

import { HistoryItemType } from '@app-types/history';
import { HistoryItem } from '@shri/ui-kit/components/HistoryItem';
import { useHistoryStore } from '@store/historyStore';
import { formatDate } from '@utils/formatDate';
import { removeFromHistory } from '@utils/storage';
import { useShallow } from 'zustand/react/shallow';

import styles from './HistoryList.module.css';

export const HistoryList = () => {
    const { history, showModal, setSelectedItem, removeFromHistoryStore, updateHistoryFromStorage } = useHistoryStore(
        useShallow((state) => ({
            showModal: state.showModal,
            setSelectedItem: state.setSelectedItem,
            removeFromHistoryStore: state.removeFromHistory,
            history: state.history,
            updateHistoryFromStorage: state.updateHistoryFromStorage,
        }))
    );

    useEffect(() => {
        updateHistoryFromStorage();
    }, [updateHistoryFromStorage]);

    const handleItemClick = (item: HistoryItemType) => {
        setSelectedItem(item);
        showModal();
    };

    const handleDeleteItem = (id: string) => {
        removeFromHistory(id);
        removeFromHistoryStore(id);
    };

    return (
        <div className={styles.list} data-testid="history-list">
            {history.map((item) => {
                const { id, fileName, timestamp, highlights } = item;
                return (
                    <HistoryItem
                        key={id}
                        fileName={fileName}
                        date={formatDate(timestamp)}
                        hasHighlights={Boolean(highlights)}
                        onClick={() => handleItemClick(item)}
                        onDelete={() => handleDeleteItem(id)}
                    />
                );
            })}
        </div>
    );
};
