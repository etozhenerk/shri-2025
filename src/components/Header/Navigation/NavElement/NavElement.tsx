import { FC } from 'react';

import { Typography } from '@shri/ui-kit';
import cn from 'classnames';
import { NavLink } from 'react-router-dom';

import styles from './NavElement.module.css';

type Props = {
    to: string;
    title: string;
    end?: boolean;
    icon: React.ReactNode;
    'data-testid'?: string;
};

export const NavElement: FC<Props> = ({ to, title, icon, end = false, 'data-testid': testId }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }: { isActive: boolean }) => cn(styles.root, { [styles.active]: isActive })}
            end={end}
            data-testid={testId}
        >
            {icon}
            <Typography size="m">{title}</Typography>
        </NavLink>
    );
};
