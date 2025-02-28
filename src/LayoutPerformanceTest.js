/** eslint-disable */

import React, { useMemo, useRef, useState } from 'react';
import './LayoutPerformanceTest.css';

const LayoutPerformanceTest = () => {
  const subgridRef = useRef(null);
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

  const rows = useMemo(() => generateRows(10000), []);

  // Grid Layout Component
  const applyGridLayoutResize = (element, size) => {
    element.style.setProperty('--column-0-width', `${size}px`);
  };

  const GridLayoutComponent = () => (
    <div className="grid-layout" ref={gridRef} role="grid">
      <div className="grid-row" key="header" role="row">
        <div className="cell" key="column-1-header" role="columnheader">
          Column 1
        </div>
        <div className="cell" key="column-2-header" role="columnheader">
          Column 2
        </div>
        <div className="cell" key="column-3-header" role="columnheader">
          Column 3
        </div>
      </div>
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

  // Subgrid Layout Component
  const applySubgridLayoutResize = (element, size) => {
    element.style.gridTemplateColumns = `${size}px 1fr 1fr`;
  };

  const SubgridLayoutComponent = () => (
    <div className="subgrid-layout" ref={subgridRef} role="grid">
      <div className="subgrid-row" key="header" role="row">
        <div className="cell" key="column-1-header" role="columnheader">
          Column 1
        </div>
        <div className="cell" key="column-2-header" role="columnheader">
          Column 2
        </div>
        <div className="cell" key="column-3-header" role="columnheader">
          Column 3
        </div>
      </div>
      {rows.map((row) => (
        <div className="subgrid-row" key={row.id} role="row">
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
  const applyTableLayoutResize = (element, size) => {
    // Update width of <col> component within the <colgroup>
    element.children[0].children[0].style.width = `${size}px`;
  };

  const TableLayoutComponent = () => (
    <table
      className="table-layout"
      style={{ tableLayout: 'fixed' }}
      ref={tableRef}
    >
      <colgroup>
        <col style={{ width: '200px' }} />
        <col style={{ width: '200px' }} />
        <col style={{ width: 'auto' }} />
      </colgroup>
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

  // Flex layout
  const applyFlexLayoutResize = (element, size) => {
    element.style.setProperty('--column-0-width', `${size}px`);
  };

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

  const tests = {
    grid: {
      element: () => gridRef.current,
      applyResize: applyGridLayoutResize,
    },
    subgrid: {
      element: () => subgridRef.current,
      applyResize: applyGridLayoutResize,
    },
    table: {
      element: () => tableRef.current,
      applyResize: applyTableLayoutResize,
    },
    flex: {
      element: () => flexRef.current,
      applyResize: applyFlexLayoutResize,
    },
  };

  // Performance test function
  const testResize = async (iterations, type) => {
    setTestType(type);
    setTesting(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const element = tests[type].element();

    const results = [];
    const sizes = [150, 200, 250, 300];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      // Simulate column resizing
      tests[type].applyResize(element, sizes[i % sizes.length]);

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

  return (
    <div>
      <div className="controls">
        <button onClick={() => testResize(50, 'grid')}>
          Test Grid Resizing
        </button>
        <button onClick={() => testResize(50, 'subgrid')}>
          Test Sub Grid Resizing
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
          {testType === 'grid' && <GridLayoutComponent />}
          {testType === 'subgrid' && <SubgridLayoutComponent />}
          {testType === 'table' && <TableLayoutComponent />}
          {testType === 'flex' && <FlexLayoutComponeent />}
        </div>
      )}
    </div>
  );
};

export default LayoutPerformanceTest;
