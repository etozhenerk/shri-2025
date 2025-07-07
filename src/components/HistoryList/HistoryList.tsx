import { useEffect, useCallback, useMemo } from 'react';

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

    const handleItemClick = useCallback((item: HistoryItemType) => {
        setSelectedItem(item);
        showModal();
    }, [setSelectedItem, showModal]);

    const handleDeleteItem = useCallback((id: string) => {
        removeFromHistory(id);
        removeFromHistoryStore(id);
    }, [removeFromHistoryStore]);

    // Мемоизируем обработанные данные истории с колбэками
    const processedHistory = useMemo(() => 
        history.map((item) => ({
            ...item,
            formattedDate: formatDate(item.timestamp),
            hasHighlights: Boolean(item.highlights),
            // Мемоизируем колбэки для каждого элемента
            onItemClick: () => handleItemClick(item),
            onItemDelete: () => handleDeleteItem(item.id)
        })), 
        [history, handleItemClick, handleDeleteItem]
    );

    return (
        <div className={styles.list} data-testid="history-list">
            {processedHistory.map((item) => (
                <HistoryItem
                    key={item.id}
                    fileName={item.fileName}
                    date={item.formattedDate}
                    hasHighlights={item.hasHighlights}
                    onClick={item.onItemClick}
                    onDelete={item.onItemDelete}
                />
            ))}
        </div>
    );
};
