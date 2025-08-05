
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Person } from '@shared/schema';
import { Users } from 'lucide-react';
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
  generation: number;
  familyGroup: string;
}

interface Connection {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  type: 'spouse' | 'parent-child' | 'family-line';
  points?: Position[];
}

interface FamilyTreeProps {
  people: Person[];
}

export default function FamilyTree({ people }: FamilyTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<PersonNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });

  // Initialize nodes with fixed positions based on family relationships
  useEffect(() => {
    const familyStructure = createFamilyStructure(people);
    setNodes(familyStructure.nodes);
    setConnections(familyStructure.connections);
  }, [people]);

  const createFamilyStructure = (people: Person[]) => {
    const findPersonByName = (firstName: string, lastName: string) => {
      return people.find(p => p.firstName === firstName && p.lastName === lastName);
    };

    // Define family structure with fixed positions
    const families = [
      {
        name: 'Sevilla',
        parents: [
          { firstName: 'Robert', lastName: 'Sevilla', x: 150, y: 100 },
          { firstName: 'Imelda', lastName: 'Sevilla', x: 300, y: 100 }
        ],
        children: [
          { firstName: 'Patricia', lastName: 'Kuo', x: 100, y: 250 },
          { firstName: 'Rap', lastName: 'Sevilla', x: 225, y: 250 },
          { firstName: 'Colleen', lastName: 'Sevilla', x: 350, y: 250 }
        ],
        familyCenter: { x: 225, y: 175 }
      },
      {
        name: 'De Guzman',
        parents: [
          { firstName: 'Egay', lastName: 'De Guzman', x: 550, y: 100 },
          { firstName: 'Oyang', lastName: 'De Guzman', x: 700, y: 100 }
        ],
        children: [
          { firstName: 'Daniel', lastName: 'De Guzman', x: 500, y: 250 },
          { firstName: 'Ryan', lastName: 'De Guzman', x: 600, y: 250 },
          { firstName: 'Eric', lastName: 'De Guzman', x: 700, y: 250 },
          { firstName: 'Nat', lastName: 'De Guzman', x: 800, y: 250 }
        ],
        familyCenter: { x: 625, y: 175 }
      },
      {
        name: 'Tiongson',
        parents: [
          { firstName: 'Nestor', lastName: 'Tiongson', x: 1000, y: 100 },
          { firstName: 'Ruby', lastName: 'Tiongson', x: 1150, y: 100 }
        ],
        children: [
          { firstName: 'Candice', lastName: 'Tiongson', x: 950, y: 250 },
          { firstName: 'Caitlin', lastName: 'Tiongson', x: 1075, y: 250 },
          { firstName: 'Adrian', lastName: 'Tiongson', x: 1200, y: 250 }
        ],
        familyCenter: { x: 1075, y: 175 }
      },
      {
        name: 'Mejia-Porto',
        parents: [
          { firstName: 'Aida', lastName: 'Mejia', x: 1400, y: 100 }
        ],
        children: [
          { firstName: 'Mark', lastName: 'Mejia', x: 1300, y: 250 },
          { firstName: 'Michael', lastName: 'Mejia', x: 1400, y: 250 },
          { firstName: 'Angel', lastName: 'Porto', x: 1500, y: 250 }
        ],
        familyCenter: { x: 1400, y: 175 }
      }
    ];

    // Define spouse couples separately positioned
    const spouseCouples = [
      {
        spouse1: { firstName: 'Steven', lastName: 'Kuo', x: 50, y: 400 },
        spouse2: { firstName: 'Patricia', lastName: 'Kuo', x: 200, y: 400 }
      },
      {
        spouse1: { firstName: 'Rap', lastName: 'Sevilla', x: 400, y: 400 },
        spouse2: { firstName: 'Alex', lastName: 'Sevilla', x: 550, y: 400 }
      },
      {
        spouse1: { firstName: 'Toper', lastName: 'Porto', x: 750, y: 400 },
        spouse2: { firstName: 'Angel', lastName: 'Porto', x: 900, y: 400 },
        children: [
          { firstName: 'Tala', lastName: 'Porto', x: 750, y: 550 },
          { firstName: 'Alon', lastName: 'Porto', x: 900, y: 550 }
        ]
      }
    ];

    const nodes: PersonNode[] = [];
    const connections: Connection[] = [];
    let connectionId = 0;

    // Process main families
    families.forEach((family) => {
      // Add parents with fixed positions
      family.parents.forEach((parentInfo) => {
        const person = findPersonByName(parentInfo.firstName, parentInfo.lastName);
        if (person) {
          nodes.push({
            ...person,
            position: { x: parentInfo.x, y: parentInfo.y },
            generation: 0,
            familyGroup: family.name
          });
        }
      });

      // Add children with fixed positions
      family.children.forEach((childInfo) => {
        const person = findPersonByName(childInfo.firstName, childInfo.lastName);
        if (person) {
          nodes.push({
            ...person,
            position: { x: childInfo.x, y: childInfo.y },
            generation: 1,
            familyGroup: family.name
          });
        }
      });

      // Create spouse connection if two parents
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

      // Create fork-style family connections for children
      const parentIds = family.parents
        .map(p => findPersonByName(p.firstName, p.lastName))
        .filter(Boolean)
        .map(p => p!.id);

      const childIds = family.children
        .map(c => findPersonByName(c.firstName, c.lastName))
        .filter(Boolean)
        .map(c => c!.id);

      if (parentIds.length > 0 && childIds.length > 0) {
        // Calculate horizontal line position between children
        const childPositions = family.children
          .map(c => findPersonByName(c.firstName, c.lastName))
          .filter(Boolean)
          .map(c => ({ x: family.children.find(fc => fc.firstName === c!.firstName)!.x, y: family.children.find(fc => fc.firstName === c!.firstName)!.y }));
        
        if (childPositions.length > 0) {
          const minChildX = Math.min(...childPositions.map(p => p.x));
          const maxChildX = Math.max(...childPositions.map(p => p.x));
          const childY = childPositions[0].y;
          const horizontalLineY = childY - 50; // Horizontal line above children
          
          // Create horizontal line between children
          connections.push({
            id: `family-horizontal-${connectionId++}`,
            fromPersonId: 'horizontal-line',
            toPersonId: 'horizontal-line',
            type: 'family-line',
            points: [
              { x: minChildX, y: horizontalLineY },
              { x: maxChildX, y: horizontalLineY }
            ]
          });

          // Connect horizontal line to each child (vertical down)
          childIds.forEach((childId, index) => {
            const childX = childPositions[index].x;
            connections.push({
              id: `family-child-${connectionId++}`,
              fromPersonId: 'horizontal-line',
              toPersonId: childId,
              type: 'family-line',
              points: [
                { x: childX, y: horizontalLineY },
                { x: childX, y: childY - 35 }
              ]
            });
          });

          // Connect parents to center of horizontal line
          const centerX = (minChildX + maxChildX) / 2;
          parentIds.forEach(parentId => {
            connections.push({
              id: `family-parent-${connectionId++}`,
              fromPersonId: parentId,
              toPersonId: 'horizontal-line',
              type: 'family-line',
              points: [
                { x: centerX, y: horizontalLineY }
              ]
            });
          });
        }
      }
    });

    // Process spouse couples
    spouseCouples.forEach((couple) => {
      // Add spouses
      const spouse1 = findPersonByName(couple.spouse1.firstName, couple.spouse1.lastName);
      const spouse2 = findPersonByName(couple.spouse2.firstName, couple.spouse2.lastName);

      if (spouse1) {
        nodes.push({
          ...spouse1,
          position: { x: couple.spouse1.x, y: couple.spouse1.y },
          generation: 1,
          familyGroup: 'Spouse'
        });
      }

      if (spouse2) {
        nodes.push({
          ...spouse2,
          position: { x: couple.spouse2.x, y: couple.spouse2.y },
          generation: 1,
          familyGroup: 'Spouse'
        });
      }

      // Create spouse connection
      if (spouse1 && spouse2) {
        connections.push({
          id: `spouse-${connectionId++}`,
          fromPersonId: spouse1.id,
          toPersonId: spouse2.id,
          type: 'spouse'
        });
      }

      // Add children if they exist
      if (couple.children) {
        couple.children.forEach((childInfo) => {
          const child = findPersonByName(childInfo.firstName, childInfo.lastName);
          if (child) {
            nodes.push({
              ...child,
              position: { x: childInfo.x, y: childInfo.y },
              generation: 2,
              familyGroup: 'Child'
            });
          }
        });

        // Create parent-child connections
        const childIds = couple.children
          .map(c => findPersonByName(c.firstName, c.lastName))
          .filter(Boolean)
          .map(c => c!.id);

        if (childIds.length > 0) {
          // Create horizontal line between children
          const minChildX = Math.min(...couple.children.map(c => c.x));
          const maxChildX = Math.max(...couple.children.map(c => c.x));
          const childY = couple.children[0].y;
          const horizontalLineY = childY - 50;
          
          connections.push({
            id: `family-horizontal-${connectionId++}`,
            fromPersonId: 'horizontal-line-couple',
            toPersonId: 'horizontal-line-couple',
            type: 'family-line',
            points: [
              { x: minChildX, y: horizontalLineY },
              { x: maxChildX, y: horizontalLineY }
            ]
          });

          // Connect children to horizontal line
          childIds.forEach((childId, index) => {
            const childX = couple.children![index].x;
            connections.push({
              id: `family-child-${connectionId++}`,
              fromPersonId: 'horizontal-line-couple',
              toPersonId: childId,
              type: 'family-line',
              points: [
                { x: childX, y: horizontalLineY },
                { x: childX, y: childY - 35 }
              ]
            });
          });

          // Connect parents to center of horizontal line
          const centerX = (minChildX + maxChildX) / 2;
          if (spouse1) {
            connections.push({
              id: `family-parent-${connectionId++}`,
              fromPersonId: spouse1.id,
              toPersonId: 'horizontal-line-couple',
              type: 'family-line',
              points: [
                { x: centerX, y: horizontalLineY }
              ]
            });
          }
          if (spouse2) {
            connections.push({
              id: `family-parent-${connectionId++}`,
              fromPersonId: spouse2.id,
              toPersonId: 'horizontal-line-couple',
              type: 'family-line',
              points: [
                { x: centerX, y: horizontalLineY }
              ]
            });
          }
        }
      }
    });

    // Add remaining people who don't fit in the main families or spouse couples
    const assignedPeople = new Set(nodes.map(n => n.id));
    const remainingPeople = people.filter(p => !assignedPeople.has(p.id));
    
    remainingPeople.forEach((person, index) => {
      nodes.push({
        ...person,
        position: {
          x: 1200 + (index % 4) * 150,
          y: 400 + Math.floor(index / 4) * 150
        },
        generation: 3,
        familyGroup: 'Other'
      });
    });

    return { nodes, connections };
  };

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const formatBirthday = (person: PersonNode) => {
    if (!person.month || !person.day) return '';
    const month = person.month.substring(0, 3);
    return `${month} ${person.day}${person.year ? `, ${person.year}` : ''}`;
  };

  const getPersonBorderColor = (person: PersonNode) => {
    if (!person.month) return '#d1d5db';
    return monthColors[person.month as keyof typeof monthColors] || '#d1d5db';
  };

  const getInitials = (firstName: string) => {
    return firstName.charAt(0).toUpperCase();
  };

  const renderConnection = (connection: Connection) => {
    const fromNode = nodes.find(n => n.id === connection.fromPersonId);
    const toNode = nodes.find(n => n.id === connection.toPersonId);
    
    if (connection.type === 'spouse' && fromNode && toNode) {
      // Straight horizontal line for spouses
      return (
        <line
          key={connection.id}
          x1={fromNode.position.x + 35}
          y1={fromNode.position.y}
          x2={toNode.position.x - 35}
          y2={toNode.position.y}
          stroke="#f5f5dc"
          strokeWidth="3"
        />
      );
    }

    if (connection.type === 'family-line' && connection.points && connection.points.length > 0) {
      // Handle different types of family line connections
      if ((connection.fromPersonId === 'horizontal-line' && connection.toPersonId === 'horizontal-line') ||
          (connection.fromPersonId === 'horizontal-line-couple' && connection.toPersonId === 'horizontal-line-couple')) {
        // Horizontal line between children
        const startPoint = connection.points[0];
        const endPoint = connection.points[1];
        return (
          <line
            key={connection.id}
            x1={startPoint.x}
            y1={startPoint.y}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke="#f5f5dc"
            strokeWidth="3"
          />
        );
      }

      if ((connection.fromPersonId === 'horizontal-line' || connection.fromPersonId === 'horizontal-line-couple') && toNode) {
        // Vertical line from horizontal line down to child
        const startPoint = connection.points[0];
        const endPoint = connection.points[1];
        return (
          <line
            key={connection.id}
            x1={startPoint.x}
            y1={startPoint.y}
            x2={endPoint.x}
            y2={endPoint.y}
            stroke="#f5f5dc"
            strokeWidth="3"
          />
        );
      }

      if ((connection.toPersonId === 'horizontal-line' || connection.toPersonId === 'horizontal-line-couple') && fromNode) {
        // Vertical line from parent down to horizontal line
        const centerPoint = connection.points[0];
        return (
          <line
            key={connection.id}
            x1={fromNode.position.x}
            y1={fromNode.position.y + 35}
            x2={centerPoint.x}
            y2={centerPoint.y}
            stroke="#f5f5dc"
            strokeWidth="3"
          />
        );
      }
    }

    return null;
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
          <Button size="sm" variant="outline" onClick={() => setPan({ x: 0, y: 0 })}>
            Reset View
          </Button>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200 p-2 text-sm text-gray-700">
        Drag empty space to pan • Use Reset View to center
      </div>

      {/* Family Tree Canvas */}
      <div className="relative w-full h-[800px] overflow-hidden bg-gray-800">
        <svg
          ref={svgRef}
          className={`w-full h-full ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            minWidth: '200%',
            minHeight: '200%'
          }}
          viewBox="0 0 2000 1200"
        >
          {/* Render connections first (behind nodes) */}
          {connections.map(renderConnection)}

          {/* Person Nodes */}
          {nodes.map(node => {
            const borderColor = getPersonBorderColor(node);
            const initials = getInitials(node.firstName);
            
            return (
              <g key={node.id}>
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
                
                {/* Circle with initials */}
                <circle
                  cx={node.position.x}
                  cy={node.position.y}
                  r="30"
                  fill="#f8f8f8"
                />
                
                {/* First name initial */}
                <text
                  x={node.position.x}
                  y={node.position.y + 8}
                  textAnchor="middle"
                  className="text-2xl font-bold fill-gray-800 pointer-events-none"
                  style={{ fontSize: '24px' }}
                >
                  {initials}
                </text>

                {/* Name */}
                <text
                  x={node.position.x}
                  y={node.position.y + 48}
                  textAnchor="middle"
                  className="text-sm font-bold fill-white pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {node.firstName}
                </text>
                <text
                  x={node.position.x}
                  y={node.position.y + 62}
                  textAnchor="middle"
                  className="text-sm font-bold fill-white pointer-events-none"
                  style={{ fontSize: '12px' }}
                >
                  {node.lastName}
                </text>
                
                {/* Birthday */}
                <text
                  x={node.position.x}
                  y={node.position.y + 76}
                  textAnchor="middle"
                  className="text-xs fill-gray-300 pointer-events-none"
                  style={{ fontSize: '10px' }}
                >
                  {formatBirthday(node)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
