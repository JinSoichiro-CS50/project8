
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Person } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, Save, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Position {
  x: number;
  y: number;
}

interface PersonNode extends Person {
  position: Position;
}

interface Relationship {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: 'parent' | 'spouse' | 'sibling' | 'child';
}

interface FamilyTreeProps {
  people: Person[];
}

export default function FamilyTree({ people }: FamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<PersonNode[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [connectionMode, setConnectionMode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize nodes with default positions
  useEffect(() => {
    const initialNodes: PersonNode[] = people.map((person, index) => ({
      ...person,
      position: {
        x: 200 + (index % 5) * 180,
        y: 100 + Math.floor(index / 5) * 150
      }
    }));
    setNodes(initialNodes);
  }, [people]);

  const saveFamilyTreeMutation = useMutation({
    mutationFn: (data: { nodes: PersonNode[], relationships: Relationship[] }) => 
      apiRequest("POST", "/api/family-tree", data),
    onSuccess: () => {
      toast({ title: "Success", description: "Family tree saved successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save family tree", variant: "destructive" });
    },
  });

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (connectionMode) {
      if (selectedPerson && selectedPerson !== nodeId) {
        // Create relationship
        const newRelationship: Relationship = {
          id: `${selectedPerson}-${nodeId}-${Date.now()}`,
          fromPersonId: selectedPerson,
          toPersonId: nodeId,
          type: connectionMode as Relationship['type']
        };
        setRelationships(prev => [...prev, newRelationship]);
        setSelectedPerson(null);
        setConnectionMode(null);
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

  const getRelationshipColor = (type: Relationship['type']) => {
    switch (type) {
      case 'parent': return '#ef4444';
      case 'child': return '#3b82f6';
      case 'spouse': return '#10b981';
      case 'sibling': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const renderRelationships = () => {
    return relationships.map(rel => {
      const fromNode = nodes.find(n => n.id === rel.fromPersonId);
      const toNode = nodes.find(n => n.id === rel.toPersonId);
      
      if (!fromNode || !toNode) return null;

      const dx = toNode.position.x - fromNode.position.x;
      const dy = toNode.position.y - fromNode.position.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;

      const startX = fromNode.position.x + unitX * 40;
      const startY = fromNode.position.y + unitY * 40;
      const endX = toNode.position.x - unitX * 40;
      const endY = toNode.position.y - unitY * 40;

      return (
        <g key={rel.id}>
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={getRelationshipColor(rel.type)}
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          <text
            x={(startX + endX) / 2}
            y={(startY + endY) / 2 - 5}
            fill={getRelationshipColor(rel.type)}
            fontSize="12"
            textAnchor="middle"
            className="font-semibold"
          >
            {rel.type}
          </text>
        </g>
      );
    });
  };

  const deleteRelationship = (relationshipId: string) => {
    setRelationships(prev => prev.filter(r => r.id !== relationshipId));
  };

  const saveFamilyTree = () => {
    saveFamilyTreeMutation.mutate({ nodes, relationships });
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
            variant={connectionMode === 'parent' ? 'default' : 'outline'}
            onClick={() => setConnectionMode(connectionMode === 'parent' ? null : 'parent')}
          >
            Parent
          </Button>
          <Button
            size="sm"
            variant={connectionMode === 'child' ? 'default' : 'outline'}
            onClick={() => setConnectionMode(connectionMode === 'child' ? null : 'child')}
          >
            Child
          </Button>
          <Button
            size="sm"
            variant={connectionMode === 'spouse' ? 'default' : 'outline'}
            onClick={() => setConnectionMode(connectionMode === 'spouse' ? null : 'spouse')}
          >
            Spouse
          </Button>
          <Button
            size="sm"
            variant={connectionMode === 'sibling' ? 'default' : 'outline'}
            onClick={() => setConnectionMode(connectionMode === 'sibling' ? null : 'sibling')}
          >
            Sibling
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
          Click on a person to start connecting, then click on another person to create a "{connectionMode}" relationship.
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
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#666"
              />
            </marker>
          </defs>

          {/* Relationships */}
          {renderRelationships()}

          {/* Person Nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              <circle
                cx={node.position.x}
                cy={node.position.y}
                r="40"
                fill={selectedPerson === node.id ? '#3b82f6' : '#f8fafc'}
                stroke={selectedPerson === node.id ? '#1d4ed8' : '#e2e8f0'}
                strokeWidth="3"
                className="cursor-pointer hover:stroke-primary"
                onMouseDown={(e) => handleMouseDown(e, node.id)}
              />
              <text
                x={node.position.x}
                y={node.position.y - 5}
                textAnchor="middle"
                className="text-sm font-semibold fill-foreground pointer-events-none"
              >
                {node.firstName}
              </text>
              <text
                x={node.position.x}
                y={node.position.y + 10}
                textAnchor="middle"
                className="text-xs fill-muted-foreground pointer-events-none"
              >
                {node.lastName}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Relationship List */}
      {relationships.length > 0 && (
        <div className="border-t border-border p-4">
          <h3 className="font-semibold mb-3">Relationships</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {relationships.map(rel => {
              const fromPerson = people.find(p => p.id === rel.fromPersonId);
              const toPerson = people.find(p => p.id === rel.toPersonId);
              
              return (
                <div key={rel.id} className="flex items-center justify-between text-sm bg-card p-2 rounded border">
                  <span>
                    {fromPerson?.firstName} {fromPerson?.lastName} 
                    <ArrowRight className="inline h-3 w-3 mx-1" />
                    {toPerson?.firstName} {toPerson?.lastName} 
                    <span className="ml-2 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      {rel.type}
                    </span>
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRelationship(rel.id)}
                  >
                    <Minus className="h-3 w-3" />
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
