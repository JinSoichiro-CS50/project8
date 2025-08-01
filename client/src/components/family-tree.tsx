
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Person } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Save, Users, Link, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

const monthColors = {
  'January': '#FF8C42',      // Orange
  'February': '#FFD93D',     // Yellow
  'March': '#A4B86A',        // Olive Green
  'April': '#6ECEB2',        // Cyan
  'May': '#EE6C9D',          // Pink
  'June': '#3AA9DB',         // Blue
  'July': '#FF8C42',         // Orange (repeat)
  'August': '#FFD93D',       // Yellow (repeat)
  'September': '#A4B86A',    // Olive Green (repeat)
  'October': '#6ECEB2',      // Cyan (repeat)
  'November': '#EE6C9D',     // Pink (repeat)
  'December': '#3AA9DB'      // Blue (repeat)
};

interface Position {
  x: number;
  y: number;
}

interface PersonNode extends Person {
  position: Position;
  profilePicture?: string;
}

interface Connection {
  id: string;
  fromPersonId: string;
  toPersonId: string;
}

interface FamilyTreeProps {
  people: Person[];
}

export default function FamilyTree({ people }: FamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<PersonNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize nodes with default positions
  useEffect(() => {
    const initialNodes: PersonNode[] = people.map((person, index) => ({
      ...person,
      position: {
        x: 200 + (index % 5) * 250,
        y: 150 + Math.floor(index / 5) * 200
      }
    }));
    setNodes(initialNodes);
  }, [people]);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    
    setDraggedNode(nodeId);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setDragOffset({
          x: (e.clientX - rect.left) / zoom - pan.x - node.position.x,
          y: (e.clientY - rect.top) / zoom - pan.y - node.position.y
        });
      }
    }
  }, [nodes, zoom, pan]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (draggedNode) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = (e.clientX - rect.left) / zoom - pan.x - dragOffset.x;
        const newY = (e.clientY - rect.top) / zoom - pan.y - dragOffset.y;

        setNodes(prev => prev.map(node => 
          node.id === draggedNode 
            ? { ...node, position: { x: newX, y: newY } }
            : node
        ));
      }
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [draggedNode, dragOffset, zoom, pan, isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  const [selectedPersonForUpload, setSelectedPersonForUpload] = useState<string | null>(null);

  const handleProfilePictureUpload = (nodeId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setNodes(prev => prev.map(node => 
        node.id === nodeId 
          ? { ...node, profilePicture: dataUrl }
          : node
      ));
    };
    reader.readAsDataURL(file);
  };

  const formatBirthday = (person: PersonNode) => {
    if (!person.month || !person.day) return '';
    const month = person.month.substring(0, 3);
    return `${month} ${person.day}${person.year ? `, ${person.year}` : ''}`;
  };

  const getPersonBorderColor = (person: PersonNode) => {
    if (!person.month) return '#d1d5db';
    return monthColors[person.month as keyof typeof monthColors] || '#d1d5db';
  };

  

  return (
    <div className="w-full h-full bg-background border border-border rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="bg-card border-b border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-semibold">Family Tree</span>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>
            Reset View
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 p-2 text-sm text-gray-700">
        Drag people to move them around • Drag empty space to pan • Scroll to zoom • Use Reset View to center
      </div>

      {/* Family Tree Canvas */}
      <div className="relative w-full h-[800px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <svg
          ref={svgRef}
          className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{ 
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            minWidth: '200%',
            minHeight: '200%'
          }}
          viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${1600 / zoom} ${1600 / zoom}`}
        >
          {/* Person Nodes */}
          {nodes.map(node => {
            const borderColor = getPersonBorderColor(node);
            return (
              <g key={node.id}>
                {/* Invisible interaction area */}
                <rect
                  x={node.position.x - 60}
                  y={node.position.y - 60}
                  width="120"
                  height="140"
                  fill="transparent"
                  className={`cursor-${draggedNode === node.id ? 'grabbing' : 'grab'}`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                />
                
                {/* Profile Picture with colored border */}
                <defs>
                  <clipPath id={`clip-${node.id}`}>
                    <circle cx={node.position.x} cy={node.position.y} r="35" />
                  </clipPath>
                </defs>
                
                {/* Colored border ring */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="40"
                  fill="none"
                  stroke={borderColor}
                  strokeWidth="6"
                  className="opacity-80"
                />
                
                {/* Inner white ring */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="37"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />
                
                {/* Profile Picture or placeholder */}
                {node.profilePicture ? (
                  <image
                    x={node.position.x - 35}
                    y={node.position.y - 35}
                    width="70"
                    height="70"
                    href={node.profilePicture}
                    clipPath={`url(#clip-${node.id})`}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedPersonForUpload(node.id);
                      fileInputRef.current?.click();
                    }}
                  />
                ) : (
                  <>
                    <circle
                      cx={node.position.x}
                      cy={node.position.y}
                      r="35"
                      fill="#f8f8f8"
                      className="cursor-pointer hover:fill-gray-100"
                      onClick={() => {
                        setSelectedPersonForUpload(node.id);
                        fileInputRef.current?.click();
                      }}
                    />
                    <Upload
                      x={node.position.x - 12}
                      y={node.position.y - 12}
                      width="24"
                      height="24"
                      className="fill-gray-400 pointer-events-none"
                    />
                  </>
                )}

                {/* Name */}
                <text
                  x={node.position.x}
                  y={node.position.y + 55}
                  textAnchor="middle"
                  className="text-sm font-bold fill-gray-800 pointer-events-none"
                  style={{ fontSize: '14px' }}
                >
                  {node.firstName} {node.lastName}
                </text>
                
                {/* Title/Role (you can customize this) */}
                <text
                  x={node.position.x}
                  y={node.position.y + 72}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 pointer-events-none"
                  style={{ fontSize: '11px' }}
                >
                  {formatBirthday(node)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hidden file input for profile pictures */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && selectedPersonForUpload) {
              handleProfilePictureUpload(selectedPersonForUpload, file);
            }
            e.target.value = ''; // Reset input
          }}
        />
      </div>

      
    </div>
  );
}
