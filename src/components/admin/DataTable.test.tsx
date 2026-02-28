import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DataTable from './DataTable';
import type { Column } from './DataTable';

interface TestData {
    id: number;
    name: string;
    role: string;
}

const mockData: TestData[] = [
    { id: 1, name: 'John Doe', role: 'Admin' },
    { id: 2, name: 'Jane Smith', role: 'User' },
];

const columns: Column<TestData>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Nombre', accessor: 'name' },
    { header: 'Rol', accessor: 'role' },
];

describe('DataTable Component', () => {
    it('renders correctly with data', () => {
        render(<DataTable data={mockData} columns={columns} title="Test Table" />);

        expect(screen.getByText('Test Table')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('Jane Smith')).toBeDefined();
        expect(screen.getByText('Admin')).toBeDefined();
    });

    it('shows empty message when no data', () => {
        render(<DataTable data={[]} columns={columns} />);
        expect(screen.getByText('No se encontraron resultados')).toBeDefined();
    });

    it('shows loading spinner when loading', () => {
        render(<DataTable data={[]} columns={columns} loading={true} />);
        // LoadingSpinner has a specific class or message
        expect(screen.getByRole('status')).toBeDefined();
    });

    it('calls onEdit when edit button is clicked', () => {
        const onEdit = vi.fn();
        render(<DataTable data={mockData} columns={columns} onEdit={onEdit} />);

        const editButtons = screen.getAllByTitle('Editar');
        fireEvent.click(editButtons[0]!);

        expect(onEdit).toHaveBeenCalledWith(mockData[0]);
    });

    it('calls onDelete when delete button is clicked', () => {
        const onDelete = vi.fn();
        render(<DataTable data={mockData} columns={columns} onDelete={onDelete} />);

        const deleteButtons = screen.getAllByTitle('Eliminar');
        fireEvent.click(deleteButtons[1]!);

        expect(onDelete).toHaveBeenCalledWith(mockData[1]);
    });

    it('calls onSearch when typing in search bar', () => {
        const onSearch = vi.fn();
        render(<DataTable data={mockData} columns={columns} onSearch={onSearch} />);

        const searchInput = screen.getByPlaceholderText('Buscar...');
        fireEvent.change(searchInput, { target: { value: 'Jane' } });

        expect(onSearch).toHaveBeenCalledWith('Jane');
    });

    it('renders custom column renderer', () => {
        const customColumns: Column<TestData>[] = [
            ...columns,
            {
                header: 'Custom',
                accessor: (item) => <span data-testid="custom-cell">{item.name.toUpperCase()}</span>
            }
        ];

        render(<DataTable data={mockData} columns={customColumns} />);
        expect(screen.getByText('JOHN DOE')).toBeDefined();
    });
});
