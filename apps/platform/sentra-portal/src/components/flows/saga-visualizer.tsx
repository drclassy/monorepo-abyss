'use client';

import React, { useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState, 
  addEdge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  { 
    id: '1', 
    position: { x: 0, y: 0 }, 
    data: { label: 'Saga Start' },
    style: { 
      background: '#121212', 
      color: '#fff', 
      borderRadius: '16px', 
      border: 'none',
      boxShadow: '8px 8px 16px #050505, -8px -8px 16px #1A1A1A',
      padding: '12px',
      fontSize: '12px',
      width: 160
    }
  },
  { 
    id: '2', 
    position: { x: 280, y: -70 }, 
    data: { label: 'Claude Validator' },
    style: { 
      background: '#121212', 
      color: '#fff', 
      borderRadius: '16px', 
      border: '1px solid rgba(0, 209, 255, 0.2)',
      boxShadow: 'inset 4px 4px 8px #050505, inset -4px -4px 8px #1A1A1A',
      padding: '12px',
      fontSize: '12px',
      width: 160
    }
  },
  { 
    id: '3', 
    position: { x: 280, y: 70 }, 
    data: { label: 'Bayesian Engine' },
    style: { 
      background: '#121212', 
      color: '#fff', 
      borderRadius: '16px', 
      border: '1px solid rgba(0, 209, 255, 0.2)',
      boxShadow: 'inset 4px 4px 8px #050505, inset -4px -4px 8px #1A1A1A',
      padding: '12px',
      fontSize: '12px',
      width: 160
    }
  },
  { 
    id: '4', 
    position: { x: 560, y: 0 }, 
    data: { label: 'Audit Trail' },
    style: { 
      background: '#121212', 
      color: '#00D1FF', 
      borderRadius: '16px', 
      border: 'none',
      boxShadow: '8px 8px 16px #050505, -8px -8px 16px #1A1A1A',
      fontWeight: 'bold',
      padding: '12px',
      fontSize: '12px',
      width: 160,
      textShadow: '0 0 10px rgba(0, 209, 255, 0.4)'
    }
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#00D1FF' }, style: { stroke: '#00D1FF' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#00D1FF' }, style: { stroke: '#00D1FF' } },
  { id: 'e2-4', source: '2', target: '4', markerEnd: { type: MarkerType.ArrowClosed, color: '#34C759' }, style: { stroke: '#34C759' } },
  { id: 'e3-4', source: '3', target: '4', markerEnd: { type: MarkerType.ArrowClosed, color: '#34C759' }, style: { stroke: '#34C759' } },
];

export function SagaVisualizer() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="h-[450px] w-full bg-[#0A0A0A] rounded-[32px] border-none shadow-[20px_20px_60px_#050505,-20px_-20px_60px_#121212] overflow-hidden p-6">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls className="bg-[#121212] border-none shadow-lg fill-white rounded-xl" />
        <MiniMap 
          nodeStrokeColor="#00D1FF" 
          nodeColor="#121212" 
          maskColor="rgba(0, 0, 0, 0.6)" 
          className="bg-[#121212] border border-white/5 rounded-2xl shadow-inner"
        />
        <Background color="#1A1A1A" gap={20} variant="dots" />
      </ReactFlow>
    </div>
  );
}
