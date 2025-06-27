import { Button } from '@shri/ui-kit';
import { useHistoryStore } from '@store/historyStore';
import { clearHistory as clearHistoryStorage } from '@utils/storage';

export const ClearHistoryButton = () => {
    const { clearHistory, history } = useHistoryStore();

    const handleClearHistory = () => {
        clearHistory();
        clearHistoryStorage();
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <Button variant="clear" onClick={handleClearHistory} data-testid="clear-history-button">
            Очистить всё
        </Button>
    );
};
