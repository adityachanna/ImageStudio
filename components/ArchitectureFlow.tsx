'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
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
    <div className={`border border-[var(--border-strong)] rounded-xl p-4 shadow-sm flex flex-col gap-2 min-w-[220px] transition-all hover:-translate-y-1 hover:shadow-md ${data.bg || 'bg-white'}`}>
      {data.target && <Handle type="target" position={Position.Left} className="w-3 h-3 bg-slate-400 border-2 border-white rounded-full" style={{ left: '-6px' }} />}
      
      <div className="flex items-center gap-3 border-b border-[var(--border-light)] pb-3">
        <div className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm ${data.iconBg || 'bg-[var(--accent)] text-white'}`}>
          <span className="material-symbols-outlined text-[18px]">{data.icon}</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800 tracking-tight leading-tight font-display">{data.label}</div>
          {data.subLabel && <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mt-1">{data.subLabel}</div>}
        </div>
      </div>

      {data.status && (
        <div className="flex items-center gap-2 mt-2 bg-slate-50 border border-[var(--border-light)] rounded-md px-2 py-1 w-fit">
          <span className={`w-2 h-2 rounded-full ${data.statusColor || 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse'}`}></span>
          <span className="text-[10px] text-slate-600 font-medium uppercase tracking-wide">{data.status}</span>
        </div>
      )}

      {data.points && (
        <ul className="text-[11px] text-slate-600 mt-2 pl-0 list-none space-y-1.5 font-medium">
          {data.points.map((p: string, idx: number) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-[var(--accent)] mt-0.5">→</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}

      {data.source && <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[var(--accent)] border-2 border-white rounded-full" style={{ right: '-6px' }} />}
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
    position: { x: 50, y: 300 },
    data: { label: 'Web Input', subLabel: 'User Reports', icon: 'person', iconBg: 'bg-white border border-slate-200 text-slate-600', bg: 'bg-slate-50', source: true, target: false },
    draggable: true,
  },
  {
    id: 'master',
    type: 'customNode',
    position: { x: 380, y: 300 },
    data: {
      label: 'Master Agent',
      icon: 'account_tree',
      iconBg: 'bg-slate-800 text-white',
      bg: 'bg-white border-blue-100',
      status: 'Thinking...',
      statusColor: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse',
      points: ['Multimodal Intake', 'Semantic Search', 'Orchestration'],
      source: true, target: true
    },
    draggable: true,
  },
  {
    id: 'dup',
    type: 'customNode',
    position: { x: 800, y: 150 },
    data: { label: 'Duplicate Found', subLabel: 'Update DB & Halt', status: 'Halted', statusColor: 'bg-rose-500', icon: 'content_copy', iconBg: 'bg-white border border-slate-200 text-slate-600', bg: 'bg-slate-50', source: true, target: true },
    draggable: true,
  },
  {
    id: 'dup_comment',
    type: 'customNode',
    position: { x: 1150, y: 150 },
    data: { label: 'GitHub Sync', subLabel: 'Comment on Issue', status: 'Pending', statusColor: 'bg-slate-400', icon: 'chat', iconBg: 'bg-slate-800 text-white', bg: 'bg-slate-50', source: false, target: true },
    draggable: true,
  },
  {
    id: 'code',
    type: 'customNode',
    position: { x: 800, y: 450 },
    data: { label: 'Code Research', subLabel: 'OpenCode Agent', status: 'Active', statusColor: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]', icon: 'terminal', iconBg: 'bg-[var(--accent)] text-white', bg: 'white', source: true, target: true },
    draggable: true,
  },
  {
    id: 'db',
    type: 'customNode',
    position: { x: 1150, y: 450 },
    data: { label: 'Save Report', subLabel: 'Write DB Context', status: 'Pending', statusColor: 'bg-slate-400', icon: 'database', iconBg: 'bg-slate-800 text-white', bg: 'bg-slate-50', source: true, target: true },
    draggable: true,
  },
  {
    id: 'github_issue',
    type: 'customNode',
    position: { x: 1450, y: 450 },
    data: { label: 'GitHub Sync', subLabel: 'Create Issue / PR', status: 'Pending', statusColor: 'bg-slate-400', icon: 'code', iconBg: 'bg-slate-800 text-white', bg: 'bg-slate-50', source: false, target: true },
    draggable: true,
  },
];

const edgeDefault = {
  animated: true,
  style: { stroke: '#94a3b8', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
};

const initialEdges: Edge[] = [
  { id: 'e-1', source: 'user', target: 'master', label: 'SYS_DATA', style: { stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '5 5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' } },
  { id: 'e-2', source: 'master', target: 'dup', label: 'RTE_DUP', ...edgeDefault, animated: false },
  { id: 'e-2-comment', source: 'dup', target: 'dup_comment', ...edgeDefault, animated: false },
  { id: 'e-3', source: 'master', target: 'code', label: 'RTE_NEW', style: { stroke: '#3b82f6', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }, animated: true },
  { id: 'e-4', source: 'code', target: 'db', ...edgeDefault },
  { id: 'e-5', source: 'db', target: 'github_issue', ...edgeDefault },
];

export default function ArchitectureFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full relative overflow-hidden font-display bg-white" style={{
      backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
      backgroundSize: '20px 20px'
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, duration: 800 }}
        onInit={(instance) => {
          setTimeout(() => {
            instance.fitView({ padding: 0.15, duration: 800 });
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