'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// --- CUSTOM NODES ---

const CustomNode = ({ data }: any) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-lg flex items-center gap-3 min-w-[210px] transition-all hover:border-primary/50">
      {data.target && <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-slate-400 border-none" />}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${data.iconBg || 'bg-primary'}`}>
        <span className="material-symbols-outlined text-[18px]">{data.icon}</span>
      </div>
      <div>
        <div className="text-[13px] font-bold text-slate-800 leading-tight">{data.label}</div>
        {data.subLabel && <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{data.subLabel}</div>}
        {data.status && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{data.status}</span>
          </div>
        )}
        {data.points && (
          <ul className="text-[10.5px] text-slate-600 mt-2 pl-3 list-none space-y-1 font-medium">
            {data.points.map((p: string, idx: number) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="opacity-50 mt-0.5">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {data.source && <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-primary border-none" />}
    </div>
  );
};

const nodeTypes = {
  customNode: CustomNode,
};

// --- INITIAL DATA ---

const initialNodes: Node[] = [
  {
    id: 'user',
    type: 'customNode',
    position: { x: 30, y: 300 },
    data: { label: 'Web Input', subLabel: 'User Reports', icon: 'person', iconBg: 'bg-slate-200 !text-slate-700', source: true, target: false },
    draggable: true,
  },
  {
    id: 'master',
    type: 'customNode',
    position: { x: 380, y: 300 },
    data: { 
      label: 'Master Agent', 
      icon: 'account_tree', 
      iconBg: 'bg-black', 
      status: 'Thinking...',
      points: ['Multimodal Intake', 'Semantic Search', 'Orchestration'],
      source: true, target: true 
    },
    draggable: true,
  },
  {
    id: 'dup',
    type: 'customNode',
    position: { x: 850, y: 180 },
    data: { label: 'Duplicate Found', subLabel: 'Update DB & Halt', status: 'Active', icon: 'content_copy', iconBg: 'bg-[#f8fafc] !text-orange-500 border border-slate-200', source: false, target: true },
    draggable: true,
  },
  {
    id: 'code',
    type: 'customNode',
    position: { x: 850, y: 420 },
    data: { label: 'Code Research', subLabel: 'OpenCode Agent', status: 'Active', icon: 'terminal', iconBg: 'bg-[#f8fafc] !text-green-600 border border-slate-200', source: true, target: true },
    draggable: true,
  },
  {
    id: 'db',
    type: 'customNode',
    position: { x: 1300, y: 420 },
    data: { label: 'Save Report', subLabel: 'Write DB Context', status: 'Active', icon: 'database', iconBg: 'bg-[#f8fafc] !text-indigo-500 border border-slate-200', source: false, target: true },
    draggable: true,
  },
];

const edgeDefault = {
  animated: true,
  style: { stroke: '#94a3b8', strokeWidth: 2, strokeDasharray: '4 4' },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
};

const initialEdges: Edge[] = [
  { id: 'e-1', source: 'user', target: 'master', label: 'Multimodal Data', animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' } },
  { id: 'e-2', source: 'master', target: 'dup', label: 'If Duplicate', ...edgeDefault, style: { stroke: '#f97316', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } },
  { id: 'e-3', source: 'master', target: 'code', label: 'If New Issue', ...edgeDefault, style: { stroke: '#16a34a', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#16a34a' } },
  { id: 'e-4', source: 'code', target: 'db', ...edgeDefault },
];

export default function ArchitectureFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full relative overflow-hidden font-body custom-flow">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1, duration: 800 }}
        onInit={(instance) => {
          setTimeout(() => {
            instance.fitView({ padding: 0.1, duration: 800 });
          }, 300);
        }}
        panOnScroll={false}
        zoomOnScroll={false}
        panOnDrag={false}
        nodesDraggable={true}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
