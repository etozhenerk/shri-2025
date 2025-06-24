import { Create } from '@ui/icons/Create';
import { History } from '@ui/icons/History';
import { Upload } from '@ui/icons/Upload';

import { NavElement } from './NavElement';
import styles from './Navigation.module.css';

export const Navigation = () => {
    return (
        <nav className={styles.root} data-testid="navigation">
            <NavElement to="/" title="CSV Аналитик" icon={<Upload size={36} />} end data-testid="navigation-home" />
            <NavElement
                to="/generate"
                title="CSV Генератор"
                icon={<Create size={36} />}
                data-testid="navigation-generate"
            />
            <NavElement to="/history" title="История" icon={<History size={36} />} data-testid="navigation-history" />
        </nav>
    );
};
