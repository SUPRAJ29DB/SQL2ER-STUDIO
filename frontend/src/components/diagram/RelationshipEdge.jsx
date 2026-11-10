import React from 'react';

export const RelationshipEdge = ({ edge, sourceNode, targetNode, isSelected, onClick }) => {
  if (!sourceNode || !targetNode) return null;

  // Node dimensions: width = 288px (w-72), estimated center points
  const sourceWidth = 288;
  const targetWidth = 288;

  const srcHeight = 40 + (sourceNode.data?.table?.columns?.length || 1) * 26;
  const tgtHeight = 40 + (targetNode.data?.table?.columns?.length || 1) * 26;

  // Compute centers
  const srcCenter = {
    x: sourceNode.position.x + sourceWidth / 2,
    y: sourceNode.position.y + Math.min(srcHeight, 150) / 2,
  };
  const tgtCenter = {
    x: targetNode.position.x + targetWidth / 2,
    y: targetNode.position.y + Math.min(tgtHeight, 150) / 2,
  };

  // Determine which side to connect (left or right)
  const isTargetToTheRight = tgtCenter.x > srcCenter.x;
  const startX = isTargetToTheRight ? sourceNode.position.x + sourceWidth : sourceNode.position.x;
  const startY = srcCenter.y;
  const endX = isTargetToTheRight ? targetNode.position.x : targetNode.position.x + targetWidth;
  const endY = tgtCenter.y;

  // Cubic Bezier control points
  const deltaX = Math.abs(endX - startX) * 0.5;
  const cp1X = isTargetToTheRight ? startX + deltaX : startX - deltaX;
  const cp1Y = startY;
  const cp2X = isTargetToTheRight ? endX - deltaX : endX + deltaX;
  const cp2Y = endY;

  const pathData = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const cardinality = edge.data?.cardinality || '1:N';

  return (
    <g className="cursor-pointer group" onClick={onClick}>
      {/* Invisible wider hover hit-area */}
      <path
        d={pathData}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
      />

      {/* Main connector path */}
      <path
        d={pathData}
        fill="none"
        stroke={isSelected ? '#6366f1' : '#475569'}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={edge.data?.isJunctionTable ? '4 4' : 'none'}
        className="transition-colors group-hover:stroke-indigo-400"
      />

      {/* Cardinality Badge Marker */}
      <foreignObject x={midX - 18} y={midY - 12} width={36} height={24}>
        <div
          className={`flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-mono font-bold shadow-md border ${
            isSelected
              ? 'bg-indigo-600 text-white border-indigo-400'
              : 'bg-[#0f172a] text-indigo-300 border-slate-700 group-hover:border-indigo-400'
          }`}
          title={`${edge.data?.sourceColumn} -> ${edge.data?.targetColumn} (${cardinality})`}
        >
          {cardinality}
        </div>
      </foreignObject>
    </g>
  );
};

