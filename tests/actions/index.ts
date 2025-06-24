import { GenerateActions } from './generateActions';
import { HistoryActions } from './historyActions';
import { HomeActions } from './homeActions';

export const actionClasses = {
    home: HomeActions,
    generate: GenerateActions,
    history: HistoryActions,
}; 