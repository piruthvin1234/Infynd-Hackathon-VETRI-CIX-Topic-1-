import React, { useMemo } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';

const nodeStyles = {
    company: { background: '#2563eb', color: 'white', border: 'none', width: 100, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', borderRadius: '50%' },
    industry: { background: '#e0f2fe', color: '#0369a1', border: '1px solid #0ea5e9', padding: '10px', borderRadius: '8px' },
    product: { background: '#f0fdf4', color: '#15803d', border: '1px solid #22c55e', padding: '10px', borderRadius: '8px' },
    person: { background: '#fdf4ff', color: '#a21caf', border: '1px solid #e879f9', padding: '10px', borderRadius: '8px' },
    tech: { background: '#eef2ff', color: '#4338ca', border: '1px solid #6366f1', padding: '10px', borderRadius: '8px' },
    location: { background: '#fef2f2', color: '#b91c1c', border: '1px solid #ef4444', padding: '10px', borderRadius: '8px' },
    default: { background: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }
};

export default function GraphView({ graphData }) {
    const { initialNodes, initialEdges } = useMemo(() => {
        if (!graphData) return { initialNodes: [], initialEdges: [] };

        const nodes = graphData.nodes.map((node, index) => {
            // Simple radial layout
            const angle = (index / graphData.nodes.length) * 2 * Math.PI;
            const radius = node.type === 'company' ? 0 : 300;
            const x = 400 + radius * Math.cos(angle);
            const y = 300 + radius * Math.sin(angle);

            return {
                id: node.id,
                type: 'default',
                data: { label: node.label },
                position: { x, y },
                style: nodeStyles[node.type] || nodeStyles.default,
            };
        });

        const edges = graphData.edges.map((edge, i) => ({
            id: `e${i}`,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            animated: true,
            style: { stroke: '#94a3b8' },
        }));

        return { initialNodes: nodes, initialEdges: edges };
    }, [graphData]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background />
                <Controls />
                <MiniMap />
            </ReactFlow>
        </div>
    );
}
