import { Header } from '@components/Header';
import { Outlet } from 'react-router-dom';

import styles from './MainLayout.module.css';

export const MainLayout = () => {
    return (
        <div className={styles.layout}>
            <a href="#main-content" className="skip-link">
                Перейти к основному содержимому
            </a>
            <Header />
            <main id="main-content" className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}; 