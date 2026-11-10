import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import { TableNode } from './TableNode';
import { RelationshipEdge } from './RelationshipEdge';
import { DiagramToolbar } from './DiagramToolbar';
import { diagramApi } from '../../services/diagramApi';

export const ERDiagram = () => {
  const {
    diagramLayout,
    setDiagramLayout,
    selectedTable,
    setSelectedTable,
    selectedRelationship,
    setSelectedRelationship,
    schemaDefinition,
    setIsAIAssistantOpen,
  } = useAppStore();

  const [pan, setPan] = useState({ x: 50, y: 50 });
  const [zoom, setZoom] = useState(1.0);
  const [isPanning, setIsPanning] = useState(false);
  const [draggedNode, setDraggedNode] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.05;
    if (e.deltaY < 0) {
      setZoom((z) => Math.min(z * zoomFactor, 2.0));
    } else {
      setZoom((z) => Math.max(z / zoomFactor, 0.4));
    }
  };

  // Canvas Pan Handlers
  const handleMouseDownCanvas = (e) => {
    // Only pan if clicking empty canvas
    if (e.target === containerRef.current || e.target.tagName === 'svg') {
      setIsPanning(true);
      setSelectedTable(null);
      setSelectedRelationship(null);
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    } else if (draggedNode) {
      const newX = (e.clientX - pan.x - dragOffset.x) / zoom;
      const newY = (e.clientY - pan.y - dragOffset.y) / zoom;

      setDiagramLayout((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === draggedNode.id
            ? { ...n, position: { x: Math.round(newX), y: Math.round(newY) } }
            : n
        ),
      }));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNode(null);
  };

  // Node Drag Start
  const handleNodeMouseDown = (e, node) => {
    e.stopPropagation();
    setSelectedTable(node.data?.table);
    setDraggedNode(node);
    setDragOffset({
      x: e.clientX - (pan.x + node.position.x * zoom),
      y: e.clientY - (pan.y + node.position.y * zoom),
    });
  };

  // Auto layout
  const handleAutoLayout = async () => {
    if (!schemaDefinition?.tables?.length) return;
    try {
      const res = await diagramApi.computeLayout(schemaDefinition);
      if (res.success && res.data) {
        setDiagramLayout(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetView = () => {
    setPan({ x: 60, y: 60 });
    setZoom(1.0);
  };

  const nodes = diagramLayout?.nodes || [];
  const edges = diagramLayout?.edges || [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDownCanvas}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full bg-[#090d16] bg-grid-dots overflow-hidden cursor-grab active:cursor-grabbing select-none"
    >
      {/* Floating Diagram Toolbar */}
      <DiagramToolbar
        zoom={zoom}
        setZoom={setZoom}
        onResetView={handleResetView}
        onAutoLayout={handleAutoLayout}
      />

      {/* Scaled & Panned Canvas Viewport */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-auto overflow-visible">
          {edges.map((edge) => {
            const srcNode = nodeMap.get(edge.source);
            const tgtNode = nodeMap.get(edge.target);
            const isSelected = selectedRelationship?.id === edge.id;

            return (
              <RelationshipEdge
                key={edge.id}
                edge={edge}
                sourceNode={srcNode}
                targetNode={tgtNode}
                isSelected={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRelationship(edge);
                  setIsAIAssistantOpen(true);
                }}
              />
            );
          })}
        </svg>

        {/* Table Nodes Layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {nodes.map((node) => (
            <TableNode
              key={node.id}
              node={node}
              isSelected={selectedTable?.name === node.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTable(node.data?.table);
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, node)}
            />
          ))}
        </div>
      </div>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none space-y-2">
          <p className="text-slate-500 text-sm font-medium">No diagram loaded.</p>
          <p className="text-slate-600 text-xs">Import a SQL script or connect to a database to generate an ER diagram.</p>
        </div>
      )}
    </div>
  );
};

