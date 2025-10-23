import React from 'react';
import { Box } from '@mui/material';

interface PathRow {
  currentPath: string;
  nextPath: string[];
  description: string;
  prefix: string;
  status: 'Active' | 'Inactive';
}

interface Props {
  data: PathRow[];
  selectedPath: string;
}

export default function PathsGraph({ data, selectedPath }: Props) {
  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <svg width="100%" height="100%">
        {data.map((row, idx) => {
          const isSelected =
            row.currentPath === selectedPath ||
            row.nextPath.includes(selectedPath);

          return (
            <g key={idx} transform={`translate(${50 + idx * 150}, 50)`}>
              <rect
                width={120}
                height={50}
                rx={10}
                ry={10}
                fill={isSelected ? '#FFD700' : '#eee'} // highlight selected
                stroke="#333"
              />
              <text
                x={60}
                y={25}
                textAnchor="middle"
                alignmentBaseline="central"
                fontWeight="bold"
              >
                {row.currentPath}
              </text>
            </g>
          );
        })}

        {/* Edges */}
        {data.map((row, idx) => {
          return row.nextPath.map((next, j) => {
            const targetIndex = data.findIndex((d) => d.currentPath === next);
            if (targetIndex === -1) return null;
            return (
              <line
                key={`${idx}-${j}`}
                x1={50 + idx * 150 + 60}
                y1={75}
                x2={50 + targetIndex * 150 + 60}
                y2={50}
                stroke="#aaa"
                strokeWidth={2}
              />
            );
          });
        })}
      </svg>
    </Box>
  );
}
