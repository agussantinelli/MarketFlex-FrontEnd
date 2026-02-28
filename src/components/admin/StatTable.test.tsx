import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatTable from './StatTable';

describe('StatTable Component', () => {
    const headers = ['Nombre', 'Valor'];
    const data = [
        { id: 1, name: 'Item 1', value: 100 },
        { id: 2, name: 'Item 2', value: 200 }
    ];

    const renderRow = (item: typeof data[0]) => (
        <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.value}</td>
        </tr>
    );

    it('should render the title and headers correctly', () => {
        render(
            <StatTable
                title="Test Table"
                headers={headers}
                data={data}
                renderRow={renderRow}
            />
        );

        expect(screen.getByText('Test Table')).toBeInTheDocument();
        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Valor')).toBeInTheDocument();
    });

    it('should render the data rows accurately', () => {
        render(
            <StatTable
                title="Test Table"
                headers={headers}
                data={data}
                renderRow={renderRow}
            />
        );

        expect(screen.getByText('Item 1')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('Item 2')).toBeInTheDocument();
        expect(screen.getByText('200')).toBeInTheDocument();
    });

    it('should show the empty state message when data is an empty array', () => {
        render(
            <StatTable
                title="Empty Table"
                headers={headers}
                data={[]}
                renderRow={renderRow}
            />
        );

        expect(screen.getByText('Sin datos disponibles.')).toBeInTheDocument();
        // Should still render headers
        expect(screen.getByText('Nombre')).toBeInTheDocument();
    });
});
