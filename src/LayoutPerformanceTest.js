/** eslint-disable */

import React, { useRef, useState } from 'react';
import './LayoutPerformanceTest.css';

const LayoutPerformanceTest = () => {
  const gridRef = useRef(null);
  const tableRef = useRef(null);
  const flexRef = useRef(null);
  const [results, setResults] = useState([]);

  const [testType, setTestType] = useState(null);
  const [testing, setTesting] = useState(false);

  // Generate test data
  const generateRows = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      cells: Array.from({ length: 3 }, (_, j) => ({
        id: j + 1,
        content: `Row ${i + 1}, Cell ${j + 1}`,
      })),
    }));
  };

  const rows = generateRows(10000);

  // Performance test function
  const testResize = async (iterations, type) => {
    setTestType(type);
    setTesting(true);

    console.log(testing);
    console.log(testType);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const element =
      type === 'grid'
        ? gridRef.current
        : type === 'flex'
        ? flexRef.current
        : tableRef.current;

    const results = [];
    const sizes = [150, 200, 250, 300];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate column resizing
      if (type === 'grid') {
        const value = sizes[i % sizes.length];
        element.style.gridTemplateColumns = `${value}px 200px 200px`;
      }

      if (type === 'table') {
        // element.style.setProperty(
        //   '--column-0-width',
        //   `${sizes[i % sizes.length]}px`
        // );
        // For each header in the table, change the width
        const headers = element.querySelectorAll('th');
        headers[0].style.width = `${sizes[i % sizes.length]}px`;
      }

      if (type === 'flex') {
        element.style.setProperty(
          '--column-0-width',
          `${sizes[i % sizes.length]}px`
        );
      }

      // Force layout recalculation
      // eslint-disable-next-line no-unused-expressions
      element.offsetHeight;

      const end = performance.now();
      results.push(end - start);

      // Wait for next frame
      await new Promise(requestAnimationFrame);
    }

    setTesting(false);
    setTestType(null);

    const average = results.reduce((a, b) => a + b, 0) / results.length;

    setResults((prev) => [
      ...prev,
      {
        type,
        average,
        timestamp: Date.now(),
      },
    ]);
  };

  // Grid Layout Component
  const GridLayoutComponent = () => (
    <div className="grid-layout" ref={gridRef} role="grid">
      {rows.map((row) => (
        <div className="grid-row" key={row.id} role="row">
          {row.cells.map((cell) => (
            <div className="cell" key={cell.id} role="cell">
              {cell.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  // Table Layout Component
  const TableLayoutComponent = () => (
    <table className="table-layout" ref={tableRef}>
      <thead>
        <tr>
          <th>Column 1</th>
          <th>Column 2</th>
          <th>Column 3</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {row.cells.map((cell) => (
              <td className="cell" key={cell.id}>
                {cell.content}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const FlexLayoutComponeent = () => (
    <div className="flex-layout" ref={flexRef}>
      {rows.map((row) => (
        <div className="flex-row" key={row.id}>
          {row.cells.map((cell, index) => (
            <div
              className="cell"
              style={{ width: `var(--column-${index}-width)` }}
              key={cell.id}
            >
              {cell.content}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="controls">
        <button onClick={() => testResize(50, 'grid')}>
          Test Grid Resizing
        </button>
        <button onClick={() => testResize(50, 'table')}>
          Test Table Resizing
        </button>
        <button onClick={() => testResize(50, 'flex')}>
          Test Flex Resizing
        </button>
      </div>

      <div className="results">
        {results.map((result) => (
          <p key={result.timestamp}>
            {result.type} Layout average resize time:
            {result.average.toFixed(2)}ms
          </p>
        ))}
      </div>

      {testing && (
        <div
          style={{
            position: 'fixed',
            zIndex: '100',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'white',
          }}
        >
          {testType === 'table' && <TableLayoutComponent />}
          {testType === 'grid' && <GridLayoutComponent />}
          {testType === 'flex' && <FlexLayoutComponeent />}
        </div>
      )}
    </div>
  );
};

export default LayoutPerformanceTest;
