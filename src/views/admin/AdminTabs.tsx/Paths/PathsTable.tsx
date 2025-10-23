import React, { useMemo } from 'react';
import dagre from 'dagre';
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
  selectedPath?: string;
}

const pathColors: Record<string, string> = {
  Cardio: '#FFD6E0',
  Dental: '#E0D6FF',
  Pharmacy: '#D6F0FF',
  Lab: '#FFE5B4',
};

export default function PathsGraph({ data, selectedPath }: Props) {
  const { nodes, edges, graphWidth, graphHeight } = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 100 });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes with fixed width/height
    data.forEach((row) => {
      g.setNode(row.currentPath, { width: 120, height: 50 });
    });

    // Add edges for each nextPath
    data.forEach((row) => {
      row.nextPath.forEach((next) => {
        g.setEdge(row.currentPath, next);
      });
    });

    dagre.layout(g);

    const nodesArr = g.nodes().map((id) => ({
      id,
      x: g.node(id).x,
      y: g.node(id).y,
      width: g.node(id).width,
      height: g.node(id).height,
    }));

    const edgesArr = g.edges().map((e) => {
      const points = g.edge(e).points;
      return { from: e.v, to: e.w, points };
    });

    const graphWidth = g.graph().width + 200; // add some padding
    const graphHeight = g.graph().height + 100;

    return { nodes: nodesArr, edges: edgesArr, graphWidth, graphHeight };
  }, [data]);

  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${graphWidth} ${graphHeight}`}
      >
        {/* Draw edges */}
        {edges.map((e, i) => (
          <polyline
            key={i}
            points={e.points.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#aaa"
            strokeWidth={2}
          />
        ))}

        {/* Draw nodes */}
        {nodes.map((n) => {
          const isSelected = n.id === selectedPath;
          return (
            <g
              key={n.id}
              transform={`translate(${n.x - n.width / 2}, ${n.y - n.height / 2})`}
            >
              <rect
                width={n.width}
                height={n.height}
                rx={10}
                ry={10}
                fill={isSelected ? '#FFD700' : pathColors[n.id] || '#eee'}
                stroke="#333"
                strokeWidth={1.5}
              />
              <text
                x={n.width / 2}
                y={n.height / 2}
                textAnchor="middle"
                alignmentBaseline="central"
                fontWeight="bold"
                fontSize={14}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
}
