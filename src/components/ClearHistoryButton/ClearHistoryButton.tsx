import { useHistoryStore } from '@store/historyStore';
import { Button } from '@ui/Button';
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
        <Button variant="secondary" onClick={handleClearHistory} data-testid="clear-history-button">
            Очистить всё
        </Button>
    );
};
