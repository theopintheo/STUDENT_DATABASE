import React, { useEffect } from 'react';
import { useTable, useRowSelect } from 'react-table';
import './data-table.css';

const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  onRowSelectionChange,
  isLoading,
  emptyMessage = "No records found"
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    getToggleAllRowsSelectedProps,
  } = useTable(
    {
      columns,
      data,
    },
    useRowSelect
  );

  // Notify parent of selection changes
  useEffect(() => {
    if (onRowSelectionChange) {
      onRowSelectionChange(selectedFlatRows);
    }
  }, [selectedFlatRows, onRowSelectionChange]);

  if (isLoading) {
    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column, i) => (
                <th key={i}>{typeof column.Header === 'string' ? column.Header : ''}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                Loading...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table {...getTableProps()} className="data-table">
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps()}>
                  {column.render('Header', {
                    getToggleAllPageRowsSelectedProps: getToggleAllRowsSelectedProps
                  })}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.length > 0 ? (
            rows.map(row => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  onClick={(e) => {
                    // Prevent row click when clicking interactive elements
                    if (e.target.closest('input[type="checkbox"]') ||
                      e.target.closest('button') ||
                      e.target.closest('a') ||
                      e.target.closest('select')) {
                      return;
                    }
                    onRowClick && onRowClick(row.original);
                  }}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                >
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="empty-state" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;