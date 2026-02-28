import React from 'react';
import styles from './styles/dashboard.module.css';

interface StatTableProps<T> {
    title: string;
    headers: string[];
    data: T[];
    renderRow: (item: T) => React.ReactNode;
}

const StatTable = <T,>({ title, headers, data, renderRow }: StatTableProps<T>) => {
    return (
        <div className={styles.recentActivity} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.sectionHeader}>
                <h2 style={{ fontSize: '1.2rem' }}>{title}</h2>
            </div>

            <div className={styles.tableContainer} style={{ flex: 1 }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx}>{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                            data.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    {renderRow(item)}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className={styles.emptyTable}>
                                    Sin datos disponibles.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StatTable;
