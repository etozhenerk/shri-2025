import { type actionClasses } from '../actions';
import { type mockClasses } from '../mocker';
import { type pageClasses } from '../page-objects/pages';

export type Pages = {
    [K in keyof typeof pageClasses]: InstanceType<(typeof pageClasses)[K]>;
};

export type Actions = {
    [K in keyof typeof actionClasses]: InstanceType<(typeof actionClasses)[K]>;
};

export type Mocker = InstanceType<typeof mockClasses.mocker>;

export type MyFixtures = {
    pages: Pages;
    actions: Actions;
    mocker: Mocker;
}; 