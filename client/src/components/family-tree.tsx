
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Person } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Save, Users, Link, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const { toast } = useToast();
  const queryClient = useQueryClient();
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

  const saveFamilyTreeMutation = useMutation({
    mutationFn: (data: { nodes: PersonNode[], connections: Connection[] }) => 
      apiRequest("POST", "/api/family-tree", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Family tree saved successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save family tree", variant: "destructive" });
    },
  });

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    
    if (connectionMode) {
      if (selectedPerson && selectedPerson !== nodeId) {
        // Create connection
        const newConnection: Connection = {
          id: `${selectedPerson}-${nodeId}-${Date.now()}`,
          fromPersonId: selectedPerson,
          toPersonId: nodeId,
        };
        setConnections(prev => [...prev, newConnection]);
        setSelectedPerson(null);
        setConnectionMode(false);
      } else {
        setSelectedPerson(nodeId);
      }
      return;
    }

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
  }, [connectionMode, selectedPerson, nodes, zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!draggedNode) return;

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
  }, [draggedNode, dragOffset, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

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

  const renderConnections = () => {
    return connections.map(conn => {
      const fromNode = nodes.find(n => n.id === conn.fromPersonId);
      const toNode = nodes.find(n => n.id === conn.toPersonId);
      
      if (!fromNode || !toNode) return null;

      return (
        <line
          key={conn.id}
          x1={fromNode.position.x}
          y1={fromNode.position.y + 60}
          x2={toNode.position.x}
          y2={toNode.position.y + 60}
          stroke="#8b7355"
          strokeWidth="3"
          className="cursor-pointer hover:stroke-red-500"
          onClick={() => deleteConnection(conn.id)}
        />
      );
    });
  };

  const deleteConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  };

  const saveFamilyTree = () => {
    saveFamilyTreeMutation.mutate({ nodes, connections });
  };

  return (
    <div className="w-full h-full bg-background border border-border rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="bg-card border-b border-border p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-semibold">Family Tree</span>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={connectionMode ? 'default' : 'outline'}
            onClick={() => {
              setConnectionMode(!connectionMode);
              setSelectedPerson(null);
            }}
          >
            <Link className="h-4 w-4 mr-2" />
            Connect People
          </Button>
        </div>

        <div className="flex gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={() => setZoom(prev => prev * 1.2)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setZoom(prev => prev * 0.8)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={saveFamilyTree} disabled={saveFamilyTreeMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Tree
          </Button>
        </div>
      </div>

      {connectionMode && (
        <div className="bg-blue-50 border-b border-blue-200 p-2 text-sm text-blue-800">
          Click on a person to start connecting, then click on another person to create a line between them.
        </div>
      )}

      {/* Family Tree Canvas */}
      <div className="relative w-full h-[600px] overflow-hidden">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          {/* Connections */}
          {renderConnections()}

          {/* Person Nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              {/* Person Card Background */}
              <rect
                x={node.position.x - 80}
                y={node.position.y - 60}
                width="160"
                height="120"
                fill={selectedPerson === node.id ? '#dbeafe' : '#ffffff'}
                stroke={selectedPerson === node.id ? '#3b82f6' : '#e5e7eb'}
                strokeWidth="2"
                rx="8"
                className="cursor-pointer hover:stroke-primary drop-shadow-md"
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              />
              
              {/* Profile Picture */}
              {node.profilePicture ? (
                <image
                  x={node.position.x - 25}
                  y={node.position.y - 45}
                  width="50"
                  height="50"
                  href={node.profilePicture}
                  className="rounded-full cursor-pointer"
                  clipPath="circle(25px at 25px 25px)"
                  onClick={() => fileInputRef.current?.click()}
                />
              ) : (
                <circle
                  cx={node.position.x}
                  cy={node.position.y - 20}
                  r="25"
                  fill="#f3f4f6"
                  stroke="#d1d5db"
                  strokeWidth="2"
                  className="cursor-pointer hover:fill-gray-200"
                  onClick={() => fileInputRef.current?.click()}
                />
              )}

              {/* Name */}
              <text
                x={node.position.x}
                y={node.position.y + 15}
                textAnchor="middle"
                className="text-base font-bold fill-gray-800 pointer-events-none"
              >
                {node.firstName} {node.lastName}
              </text>
              
              {/* Birthday */}
              <text
                x={node.position.x}
                y={node.position.y + 35}
                textAnchor="middle"
                className="text-sm fill-gray-600 pointer-events-none"
              >
                {formatBirthday(node)}
              </text>

              {/* Upload icon for profile picture */}
              {!node.profilePicture && (
                <Upload
                  x={node.position.x - 8}
                  y={node.position.y - 28}
                  width="16"
                  height="16"
                  className="fill-gray-400 pointer-events-none"
                />
              )}
            </g>
          ))}
        </svg>

        {/* Hidden file input for profile pictures */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && selectedPerson) {
              handleProfilePictureUpload(selectedPerson, file);
            }
          }}
        />
      </div>

      {/* Connection List */}
      {connections.length > 0 && (
        <div className="border-t border-border p-4">
          <h3 className="font-semibold mb-3">Family Connections</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {connections.map(conn => {
              const fromPerson = people.find(p => p.id === conn.fromPersonId);
              const toPerson = people.find(p => p.id === conn.toPersonId);
              
              return (
                <div key={conn.id} className="flex items-center justify-between text-sm bg-card p-2 rounded border">
                  <span>
                    {fromPerson?.firstName} {fromPerson?.lastName} ⟷ {toPerson?.firstName} {toPerson?.lastName}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteConnection(conn.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
