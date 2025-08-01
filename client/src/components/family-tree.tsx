
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Person } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Users, Upload } from 'lucide-react';
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
  generation: number;
  familyGroup: string;
}

interface Connection {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: 'spouse' | 'parent-child';
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

  // Initialize nodes with structured positions based on family relationships
  useEffect(() => {
    const familyStructure = createFamilyStructure(people);
    setNodes(familyStructure.nodes);
    setConnections(familyStructure.connections);
  }, [people]);

  const createFamilyStructure = (people: Person[]) => {
    const findPersonByName = (firstName: string, lastName: string) => {
      return people.find(p => p.firstName === firstName && p.lastName === lastName);
    };

    // Define family structure based on CSV data
    const families = [
      {
        name: 'Sevilla',
        parents: [
          { firstName: 'Robert', lastName: 'Sevilla' },
          { firstName: 'Imelda', lastName: 'Sevilla' }
        ],
        children: [
          { firstName: 'Patricia', lastName: 'Kuo' },
          { firstName: 'Rap', lastName: 'Sevilla' },
          { firstName: 'Colleen', lastName: 'Sevilla' }
        ],
        startX: 100
      },
      {
        name: 'De Guzman',
        parents: [
          { firstName: 'Egay', lastName: 'De Guzman' },
          { firstName: 'Oyang', lastName: 'De Guzman' }
        ],
        children: [
          { firstName: 'Daniel', lastName: 'De Guzman' },
          { firstName: 'Ryan', lastName: 'De Guzman' },
          { firstName: 'Eric', lastName: 'De Guzman' },
          { firstName: 'Nat', lastName: 'De Guzman' }
        ],
        startX: 600
      },
      {
        name: 'Tiongson',
        parents: [
          { firstName: 'Nestor', lastName: 'Tiongson' },
          { firstName: 'Ruby', lastName: 'Tiongson' }
        ],
        children: [
          { firstName: 'Candice', lastName: 'Tiongson' },
          { firstName: 'Caitlin', lastName: 'Tiongson' },
          { firstName: 'Adrian', lastName: 'Tiongson' }
        ],
        startX: 1100
      },
      {
        name: 'Mejia',
        parents: [
          { firstName: 'Aida', lastName: 'Mejia' }
        ],
        children: [
          { firstName: 'Mark', lastName: 'Mejia' },
          { firstName: 'Michael', lastName: 'Mejia' }
        ],
        startX: 1500
      }
    ];

    const nodes: PersonNode[] = [];
    const connections: Connection[] = [];
    let connectionId = 0;

    families.forEach((family, familyIndex) => {
      const baseY = 150;
      const parentY = baseY;
      const childY = baseY + 200;

      // Add parents
      family.parents.forEach((parentInfo, parentIndex) => {
        const person = findPersonByName(parentInfo.firstName, parentInfo.lastName);
        if (person) {
          nodes.push({
            ...person,
            position: {
              x: family.startX + (parentIndex * 150),
              y: parentY
            },
            generation: 0,
            familyGroup: family.name
          });
        }
      });

      // Add spouse connection if two parents
      if (family.parents.length === 2) {
        const parent1 = findPersonByName(family.parents[0].firstName, family.parents[0].lastName);
        const parent2 = findPersonByName(family.parents[1].firstName, family.parents[1].lastName);
        if (parent1 && parent2) {
          connections.push({
            id: `spouse-${connectionId++}`,
            fromPersonId: parent1.id,
            toPersonId: parent2.id,
            type: 'spouse'
          });
        }
      }

      // Add children
      family.children.forEach((childInfo, childIndex) => {
        const person = findPersonByName(childInfo.firstName, childInfo.lastName);
        if (person) {
          nodes.push({
            ...person,
            position: {
              x: family.startX + (childIndex * 120) - 50,
              y: childY
            },
            generation: 1,
            familyGroup: family.name
          });

          // Connect children to parents
          family.parents.forEach(parentInfo => {
            const parent = findPersonByName(parentInfo.firstName, parentInfo.lastName);
            if (parent) {
              connections.push({
                id: `parent-child-${connectionId++}`,
                fromPersonId: parent.id,
                toPersonId: person.id,
                type: 'parent-child'
              });
            }
          });
        }
      });
    });

    // Add remaining people who don't fit in the main families
    const assignedPeople = new Set(nodes.map(n => n.id));
    const remainingPeople = people.filter(p => !assignedPeople.has(p.id));
    
    remainingPeople.forEach((person, index) => {
      nodes.push({
        ...person,
        position: {
          x: 200 + (index % 4) * 150,
          y: 450 + Math.floor(index / 4) * 150
        },
        generation: 2,
        familyGroup: 'Other'
      });
    });

    return { nodes, connections };
  };

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

  const renderConnection = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.fromPersonId);
    const toNode = nodes.find(n => n.id === connection.toPersonId);
    
    if (!fromNode || !toNode) return null;

    if (connection.type === 'spouse') {
      // Horizontal line for spouses
      return (
        <line
          key={connection.id}
          x1={fromNode.position.x + 40}
          y1={fromNode.position.y}
          x2={toNode.position.x - 40}
          y2={toNode.position.y}
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
      );
    } else if (connection.type === 'parent-child') {
      // L-shaped line for parent-child
      const midY = fromNode.position.y + 50;
      return (
        <g key={connection.id}>
          <line
            x1={fromNode.position.x}
            y1={fromNode.position.y + 40}
            x2={fromNode.position.x}
            y2={midY}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <line
            x1={fromNode.position.x}
            y1={midY}
            x2={toNode.position.x}
            y2={midY}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <line
            x1={toNode.position.x}
            y1={midY}
            x2={toNode.position.x}
            y2={toNode.position.y - 40}
            stroke="#94a3b8"
            strokeWidth="2"
          />
        </g>
      );
    }
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
      <div className="relative w-full h-[800px] overflow-hidden bg-gray-100">
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
          viewBox={`${-pan.x / zoom} ${-pan.y / zoom} ${2000 / zoom} ${1200 / zoom}`}
        >
          {/* Render connections first (behind nodes) */}
          {connections.map(renderConnection)}

          {/* Person Nodes */}
          {nodes.map(node => {
            const borderColor = getPersonBorderColor(node);
            return (
              <g key={node.id}>
                {/* Invisible interaction area */}
                <rect
                  x={node.position.x - 50}
                  y={node.position.y - 50}
                  width="100"
                  height="120"
                  fill="transparent"
                  className={`cursor-${draggedNode === node.id ? 'grabbing' : 'grab'}`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                />
                
                {/* Profile Picture with colored border */}
                <defs>
                  <clipPath id={`clip-${node.id}`}>
                    <circle cx={node.position.x} cy={node.position.y} r="30" />
                  </clipPath>
                </defs>
                
                {/* Colored border ring */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="35"
                  fill="none"
                  stroke={borderColor}
                  strokeWidth="4"
                  className="opacity-80"
                />
                
                {/* Inner white ring */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="32"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />
                
                {/* Profile Picture or placeholder */}
                {node.profilePicture ? (
                  <image
                    x={node.position.x - 30}
                    y={node.position.y - 30}
                    width="60"
                    height="60"
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
                      r="30"
                      fill="#f8f8f8"
                      className="cursor-pointer hover:fill-gray-100"
                      onClick={() => {
                        setSelectedPersonForUpload(node.id);
                        fileInputRef.current?.click();
                      }}
                    />
                    <Upload
                      x={node.position.x - 10}
                      y={node.position.y - 10}
                      width="20"
                      height="20"
                      className="fill-gray-400 pointer-events-none"
                    />
                  </>
                )}

                {/* Name */}
                <text
                  x={node.position.x}
                  y={node.position.y + 48}
                  textAnchor="middle"
                  className="text-sm font-bold fill-gray-800 pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {node.firstName}
                </text>
                <text
                  x={node.position.x}
                  y={node.position.y + 62}
                  textAnchor="middle"
                  className="text-sm font-bold fill-gray-800 pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {node.lastName}
                </text>
                
                {/* Birthday */}
                <text
                  x={node.position.x}
                  y={node.position.y + 76}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 pointer-events-none"
                  style={{ fontSize: '10px' }}
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
