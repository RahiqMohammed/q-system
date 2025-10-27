import React, { useMemo, useEffect, useRef } from 'react';
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
  selectedPath: string;
}

const pathColors: Record<string, string> = {
  Cardio: '#FFD6E0',
  Dental: '#E0D6FF',
  Pharmacy: '#D6F0FF',
  Lab: '#FFE5B4',
  ER: '#FFEBEE',
  Radiology: '#E8F5E9',
};

export default function PathsGraph({ data, selectedPath }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  const { nodes, edges, bounds } = useMemo(() => {
    const g = new dagre.graphlib.Graph();
    g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 60 });
    g.setDefaultEdgeLabel(() => ({}));

    const allPaths = Array.from(new Set(data.flatMap(r => [r.currentPath, ...r.nextPath])));
    allPaths.forEach(p => g.setNode(p, { width: 110, height: 45 }));

    data.forEach(r => {
      r.nextPath.forEach(next => g.setEdge(r.currentPath, next));
    });

    dagre.layout(g);

    const nodes = g.nodes().map(id => {
      const n = g.node(id);
      return { id, x: n.x, y: n.y, width: n.width, height: n.height };
    });

    const edges = g.edges().map(e => {
      const points = g.edge(e).points;
      return { source: e.v, target: e.w, points };
    });

    const minX = Math.min(...nodes.map(n => n.x - n.width / 2), 0);
    const maxX = Math.max(...nodes.map(n => n.x + n.width / 2), 100);
    const minY = Math.min(...nodes.map(n => n.y - n.height / 2), 0);
    const maxY = Math.max(...nodes.map(n => n.y + n.height / 2), 100);

    const width = maxX - minX;
    const height = maxY - minY;
    const scale = Math.max(width / 800, height / 400, 1);

    nodes.forEach(n => {
      n.x /= scale;
      n.y /= scale;
    });
    edges.forEach(e => {
      e.points.forEach(p => {
        p.x /= scale;
        p.y /= scale;
      });
    });

    const normalizedBounds = {
      minX: minX / scale,
      maxX: maxX / scale,
      minY: minY / scale,
      maxY: maxY / scale,
    };

    return { nodes, edges, bounds: normalizedBounds };
  }, [data]);

  const padding = 50;
  const baseViewBox = `${bounds.minX - padding} ${bounds.minY - padding} ${
    bounds.maxX - bounds.minX + 2 * padding
  } ${bounds.maxY - bounds.minY + 2 * padding}`;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (!selectedPath) {
      svg.setAttribute('viewBox', baseViewBox);
      return;
    }

    const node = nodes.find(n => n.id === selectedPath);
    if (!node) return;

    const zoom = 1.3;
    const cx = node.x;
    const cy = node.y;
    const vw = (bounds.maxX - bounds.minX) / zoom;
    const vh = (bounds.maxY - bounds.minY) / zoom;

    const newViewBox = `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`;

    svg.animate(
      [
        { viewBox: svg.getAttribute('viewBox') },
        { viewBox: newViewBox },
      ] as any,
      { duration: 500, fill: 'forwards', easing: 'ease-in-out' },
    );
  }, [selectedPath, nodes, bounds, baseViewBox]);

  return (
    <Box sx={{ width: '100%', height: 500, overflow: 'hidden', borderRadius: 2 }}>
      <svg ref={svgRef} width="100%" height="100%" viewBox={baseViewBox}>
        {/* Arrow marker definitions */}
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#999" />
          </marker>
          <marker
            id="arrowSelected"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2196f3" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const isActive = e.source === selectedPath || e.target === selectedPath;
          return (
            <polyline
              key={i}
              points={e.points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={isActive ? '#2196f3' : '#999'}
              strokeWidth={isActive ? 3.5 : 2}
              opacity={isActive ? 1 : 0.6}
              markerEnd={`url(#${isActive ? 'arrowSelected' : 'arrow'})`}
            >
              <animate
                attributeName="opacity"
                from={isActive ? 0.6 : 1}
                to={isActive ? 1 : 0.6}
                dur="0.3s"
                fill="freeze"
              />
            </polyline>
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const isSelected = n.id === selectedPath;
          return (
            <g
              key={n.id}
              transform={`translate(${n.x - n.width / 2}, ${n.y - n.height / 2})`}
            >
              <rect
                width={n.width}
                height={n.height}
                rx={8}
                ry={8}
                fill={pathColors[n.id] || '#eee'}
                stroke="#333"
                strokeWidth={isSelected ? 3 : 1.5}
                filter={isSelected ? 'drop-shadow(0px 0px 6px #2196f3)' : 'none'}
              >
                <animate
                  attributeName="stroke-width"
                  from={isSelected ? 1.5 : 3}
                  to={isSelected ? 3 : 1.5}
                  dur="0.3s"
                  fill="freeze"
                />
                {isSelected && (
                  <animate
                    attributeName="filter"
                    from="none"
                    to="drop-shadow(0px 0px 6px #2196f3)"
                    dur="0.3s"
                    fill="freeze"
                  />
                )}
              </rect>
              <text
                x={n.width / 2}
                y={n.height / 2}
                textAnchor="middle"
                alignmentBaseline="central"
                fontWeight="bold"
                fontSize={14}
                fill={isSelected ? '#1976d2' : '#000'}
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
