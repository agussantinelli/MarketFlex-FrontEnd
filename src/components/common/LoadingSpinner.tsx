import React from 'react';
import styles from './styles/LoadingSpinner.module.css';

type LoadingSpinnerProps = {
    message?: string;
    fullPage?: boolean;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Cargando...',
    fullPage = false
}) => {
    return (
        <div className={`${styles.loadingContainer} ${fullPage ? styles.fullPage : ''}`}>
            <div className={styles.spinner}></div>
            {message && <p className={styles.message}>{message}</p>}
        </div>
    );
};

export default LoadingSpinner;
