import React, { useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom node components
const DataSourceNode = ({ data }: any) => (
  <div className="bg-primary/20 border-2 border-primary/30 rounded-lg p-3 min-w-[120px]">
    <div className="text-xs font-semibold text-primary mb-1">DATA SOURCE</div>
    <div className="text-sm font-medium">{data.label}</div>
  </div>
);

const StrategyNode = ({ data }: any) => (
  <div className="bg-success/20 border-2 border-success/30 rounded-lg p-3 min-w-[140px]">
    <div className="text-xs font-semibold text-success mb-1">STRATEGY</div>
    <div className="text-sm font-medium">{data.label}</div>
    <div className="text-xs text-muted-foreground mt-1">{data.accuracy}% accuracy</div>
  </div>
);

const AnalysisNode = ({ data }: any) => (
  <div className="bg-warning/20 border-2 border-warning/30 rounded-lg p-3 min-w-[120px]">
    <div className="text-xs font-semibold text-warning mb-1">ANALYSIS</div>
    <div className="text-sm font-medium">{data.label}</div>
  </div>
);

const ProcessorNode = ({ data }: any) => (
  <div className="bg-secondary/20 border-2 border-secondary/30 rounded-lg p-3 min-w-[140px]">
    <div className="text-xs font-semibold text-secondary mb-1">PROCESSOR</div>
    <div className="text-sm font-medium">{data.label}</div>
  </div>
);

const OutputNode = ({ data }: any) => (
  <div className="bg-destructive/20 border-2 border-destructive/30 rounded-lg p-3 min-w-[120px]">
    <div className="text-xs font-semibold text-destructive mb-1">OUTPUT</div>
    <div className="text-sm font-medium">{data.label}</div>
  </div>
);

const nodeTypes = {
  dataSource: DataSourceNode,
  strategy: StrategyNode,
  analysis: AnalysisNode,
  processor: ProcessorNode,
  output: OutputNode,
};

const initialNodes = [
  // Data Sources
  {
    id: 'forex-data',
    type: 'dataSource',
    position: { x: 0, y: 0 },
    data: { label: 'Forex Feed' },
  },
  {
    id: 'crypto-data',
    type: 'dataSource',
    position: { x: 0, y: 100 },
    data: { label: 'Crypto Feed' },
  },
  {
    id: 'stocks-data',
    type: 'dataSource',
    position: { x: 0, y: 200 },
    data: { label: 'Stocks Feed' },
  },
  {
    id: 'news-data',
    type: 'dataSource',
    position: { x: 0, y: 300 },
    data: { label: 'News API' },
  },

  // Analysis Components
  {
    id: 'price-action',
    type: 'analysis',
    position: { x: 200, y: 0 },
    data: { label: 'Price Action' },
  },
  {
    id: 'support-resistance',
    type: 'analysis',
    position: { x: 200, y: 80 },
    data: { label: 'Support/Resistance' },
  },
  {
    id: 'order-blocks',
    type: 'analysis',
    position: { x: 200, y: 160 },
    data: { label: 'Order Blocks' },
  },
  {
    id: 'liquidity-zones',
    type: 'analysis',
    position: { x: 200, y: 240 },
    data: { label: 'Liquidity Zones' },
  },
  {
    id: 'fair-value-gaps',
    type: 'analysis',
    position: { x: 200, y: 320 },
    data: { label: 'Fair Value Gaps' },
  },

  // Strategy Modules
  {
    id: 'smc-strategy',
    type: 'strategy',
    position: { x: 400, y: 0 },
    data: { label: 'SMC (Smart Money)', accuracy: 87 },
  },
  {
    id: 'ict-strategy',
    type: 'strategy',
    position: { x: 400, y: 100 },
    data: { label: 'ICT (Inner Circle)', accuracy: 82 },
  },
  {
    id: 'orb-strategy',
    type: 'strategy',
    position: { x: 400, y: 200 },
    data: { label: 'ORB (Opening Range)', accuracy: 75 },
  },
  {
    id: 'turtle-strategy',
    type: 'strategy',
    position: { x: 400, y: 300 },
    data: { label: 'Turtle Soup', accuracy: 73 },
  },

  // Core Processors
  {
    id: 'ml-engine',
    type: 'processor',
    position: { x: 600, y: 80 },
    data: { label: 'ML Learning Engine' },
  },
  {
    id: 'strategy-selector',
    type: 'processor',
    position: { x: 600, y: 180 },
    data: { label: 'Strategy Selector' },
  },
  {
    id: 'risk-manager',
    type: 'processor',
    position: { x: 600, y: 280 },
    data: { label: 'Risk Manager' },
  },

  // Outputs
  {
    id: 'trade-signals',
    type: 'output',
    position: { x: 800, y: 100 },
    data: { label: 'Trade Signals' },
  },
  {
    id: 'risk-metrics',
    type: 'output',
    position: { x: 800, y: 200 },
    data: { label: 'Risk Metrics' },
  },
  {
    id: 'execution',
    type: 'output',
    position: { x: 800, y: 300 },
    data: { label: 'Auto Execution' },
  },
];

const initialEdges = [
  // Data sources to analysis
  { id: 'e1', source: 'forex-data', target: 'price-action', type: 'smoothstep', animated: true },
  { id: 'e2', source: 'crypto-data', target: 'support-resistance', type: 'smoothstep', animated: true },
  { id: 'e3', source: 'stocks-data', target: 'order-blocks', type: 'smoothstep', animated: true },
  { id: 'e4', source: 'forex-data', target: 'liquidity-zones', type: 'smoothstep', animated: true },
  { id: 'e5', source: 'crypto-data', target: 'fair-value-gaps', type: 'smoothstep', animated: true },

  // Analysis to strategies
  { id: 'e6', source: 'price-action', target: 'smc-strategy', type: 'smoothstep' },
  { id: 'e7', source: 'support-resistance', target: 'ict-strategy', type: 'smoothstep' },
  { id: 'e8', source: 'order-blocks', target: 'smc-strategy', type: 'smoothstep' },
  { id: 'e9', source: 'liquidity-zones', target: 'orb-strategy', type: 'smoothstep' },
  { id: 'e10', source: 'fair-value-gaps', target: 'turtle-strategy', type: 'smoothstep' },

  // Strategies to processors
  { id: 'e11', source: 'smc-strategy', target: 'ml-engine', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e12', source: 'ict-strategy', target: 'strategy-selector', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e13', source: 'orb-strategy', target: 'strategy-selector', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e14', source: 'turtle-strategy', target: 'risk-manager', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },

  // Cross connections
  { id: 'e15', source: 'ml-engine', target: 'strategy-selector', type: 'smoothstep' },
  { id: 'e16', source: 'strategy-selector', target: 'risk-manager', type: 'smoothstep' },

  // News impact
  { id: 'e17', source: 'news-data', target: 'risk-manager', type: 'smoothstep', style: { stroke: '#f59e0b', strokeDasharray: '5,5' } },

  // Processors to outputs
  { id: 'e18', source: 'ml-engine', target: 'trade-signals', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e19', source: 'strategy-selector', target: 'trade-signals', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e20', source: 'risk-manager', target: 'risk-metrics', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e21', source: 'risk-manager', target: 'execution', type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } },
];

export const MarketMindDiagram = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-[600px] bg-background rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-background"
      >
        <Background gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.type === 'dataSource') return 'hsl(var(--primary))';
            if (n.type === 'strategy') return 'hsl(var(--success))';
            if (n.type === 'analysis') return 'hsl(var(--warning))';
            if (n.type === 'processor') return 'hsl(var(--secondary))';
            return 'hsl(var(--destructive))';
          }}
          nodeColor={(n) => {
            if (n.type === 'dataSource') return 'hsl(var(--primary) / 0.2)';
            if (n.type === 'strategy') return 'hsl(var(--success) / 0.2)';
            if (n.type === 'analysis') return 'hsl(var(--warning) / 0.2)';
            if (n.type === 'processor') return 'hsl(var(--secondary) / 0.2)';
            return 'hsl(var(--destructive) / 0.2)';
          }}
          className="!bg-background border border-border"
        />
      </ReactFlow>
    </div>
  );
};