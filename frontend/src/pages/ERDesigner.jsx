import React from 'react';
import { ERDiagram } from '../components/diagram/ERDiagram';

export const ERDesigner = () => {
  return (
    <div className="flex-1 h-full w-full relative overflow-hidden bg-[#090d16]">
      <ERDiagram />
    </div>
  );
};

