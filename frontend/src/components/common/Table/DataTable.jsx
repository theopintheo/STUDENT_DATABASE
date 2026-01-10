import React from 'react';

const DataTable = ({ columns = [], data = [], onRowClick }) => {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column, idx) => (
            <th key={column.accessor ?? column.Header ?? idx}>{column.Header ?? column.header ?? ''}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={row.id ?? row._id ?? rowIndex} onClick={() => onRowClick && onRowClick(row)}>
            {columns.map((column, colIndex) => {
              const key = column.accessor ?? column.Header ?? colIndex;
              const value = column.accessor ? row[column.accessor] : undefined;

              // If a custom Cell renderer is provided, call it with a shape similar to react-table
              if (typeof column.Cell === 'function') {
                try {
                  return (
                    <td key={key}>
                      {column.Cell({ row: { original: row }, value })}
                    </td>
                  );
                } catch (err) {
                  // Avoid throwing during render; render a fallback and log
                  console.error('Error rendering cell:', err);
                  return <td key={key}>-</td>;
                }
              }

              return <td key={key}>{value ?? ''}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;