import { GenerateActions } from './generateActions';
import { HistoryActions } from './historyActions';
import { HomeActions } from './homeActions';
import { StorybookActions } from './storybookActions';

export const actionClasses = {
    home: HomeActions,
    generate: GenerateActions,
    history: HistoryActions,
    storybook: StorybookActions,
}; 