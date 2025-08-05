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
  // Include all people in the family tree, regardless of birthday information
  const validPeople = people;
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

    // Define family structure with proper spacing to avoid overlaps
    // Level 0: Grandparents generation (y: 100)
    // Level 1: Parents generation (y: 350)
    // Level 2: Children generation (y: 600)

    const families = [
      {
        name: 'Sevilla',
        parents: [
          { firstName: 'Robert', lastName: 'Sevilla', x: 200, y: 100 },
          { firstName: 'Imelda', lastName: 'Sevilla', x: 350, y: 100 }
        ],
        children: [
          { firstName: 'Patricia', lastName: 'Kuo', x: 100, y: 350 },
          { firstName: 'Rap', lastName: 'Sevilla', x: 275, y: 350 },
          { firstName: 'Colleen', lastName: 'Sevilla', x: 450, y: 350 }
        ]
      },
      {
        name: 'De Guzman',
        parents: [
          { firstName: 'Egay', lastName: 'De Guzman', x: 650, y: 100 },
          { firstName: 'Oyang', lastName: 'De Guzman', x: 800, y: 100 }
        ],
        children: [
          { firstName: 'Daniel', lastName: 'De Guzman', x: 550, y: 350 },
          { firstName: 'Ryan', lastName: 'De Guzman', x: 650, y: 350 },
          { firstName: 'Eric', lastName: 'De Guzman', x: 750, y: 350 },
          { firstName: 'Nat', lastName: 'De Guzman', x: 850, y: 350 }
        ]
      },
      {
        name: 'Tiongson',
        parents: [
          { firstName: 'Nestor', lastName: 'Tiongson', x: 1100, y: 100 },
          { firstName: 'Ruby', lastName: 'Tiongson', x: 1250, y: 100 }
        ],
        children: [
          { firstName: 'Candice', lastName: 'Tiongson', x: 1000, y: 350 },
          { firstName: 'Caitlin', lastName: 'Tiongson', x: 1175, y: 350 },
          { firstName: 'Adrian', lastName: 'Tiongson', x: 1350, y: 350 }
        ]
      },
      {
        name: 'Mejia',
        parents: [
          { firstName: 'Aida', lastName: 'Mejia', x: 1550, y: 100 }
        ],
        children: [
          { firstName: 'Boss', lastName: 'Mejia', x: 1450, y: 350 },
          { firstName: 'Michael', lastName: 'Mejia', x: 1550, y: 350 },
          { firstName: 'Angel', lastName: 'Porto', x: 1650, y: 350 },
          { firstName: 'Mark', lastName: 'Mejia', x: 1750, y: 350 }
        ]
      }
    ];

    // Define married couples with proper spacing
    const marriedCouples = [
      {
        name: 'Kuo',
        parents: [
          { firstName: 'Steven', lastName: 'Kuo', x: 200, y: 350 },
          { firstName: 'Patricia', lastName: 'Kuo', x: 100, y: 350 } // Reference to existing Patricia
        ],
        children: []
      },
      {
        name: 'Sevilla-Couple',
        parents: [
          { firstName: 'Rap', lastName: 'Sevilla', x: 275, y: 350 }, // Reference to existing Rap
          { firstName: 'Alex', lastName: 'Sevilla', x: 375, y: 350 }
        ],
        children: []
      },
      {
        name: 'Porto',
        parents: [
          { firstName: 'Toper', lastName: 'Porto', x: 1750, y: 350 },
          { firstName: 'Angel', lastName: 'Porto', x: 1650, y: 350 } // Reference to existing Angel
        ],
        children: [
          { firstName: 'Tala', lastName: 'Porto', x: 1650, y: 600 },
          { firstName: 'Alon', lastName: 'Porto', x: 1750, y: 600 }
        ]
      },
      {
        name: 'De Guzman-Ryan',
        parents: [
          { firstName: 'Ryan', lastName: 'De Guzman', x: 650, y: 350 }, // Reference to existing Ryan
          { firstName: 'Sharmain', lastName: 'De Guzman', x: 750, y: 350 }
        ],
        children: [
          { firstName: 'Aiyan', lastName: 'De Guzman', x: 700, y: 600 }
        ]
      },
      {
        name: 'De Guzman-Eric',
        parents: [
          { firstName: 'Eric', lastName: 'De Guzman', x: 750, y: 350 }, // Reference to existing Eric
          { firstName: 'Jackie', lastName: 'De Guzman', x: 850, y: 350 }
        ],
        children: []
      }
    ];

    const nodes: PersonNode[] = [];
    const connections: Connection[] = [];
    const addedPeople = new Set<string>(); // Track added people to avoid duplicates
    let connectionId = 0;

    // Add main families (parents and their children)
    families.forEach((family) => {
      // Add parents
      family.parents.forEach((parentInfo) => {
        const person = findPersonByName(parentInfo.firstName, parentInfo.lastName);
        if (person && !addedPeople.has(person.id)) {
          nodes.push({
            ...person,
            position: { x: parentInfo.x, y: parentInfo.y },
            generation: 0,
            familyGroup: family.name
          });
          addedPeople.add(person.id);
        }
      });

      // Add children
      family.children.forEach((childInfo) => {
        const person = findPersonByName(childInfo.firstName, childInfo.lastName);
        if (person && !addedPeople.has(person.id)) {
          nodes.push({
            ...person,
            position: { x: childInfo.x, y: childInfo.y },
            generation: 1,
            familyGroup: family.name
          });
          addedPeople.add(person.id);
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

      // Create T-shaped parent-child connections
      if (family.children.length > 0) {
        const parentCenterX = family.parents.length === 2 
          ? (family.parents[0].x + family.parents[1].x) / 2
          : family.parents[0].x;
        const parentY = family.parents[0].y;

        const minChildX = Math.min(...family.children.map(c => c.x));
        const maxChildX = Math.max(...family.children.map(c => c.x));
        const childY = family.children[0].y;

        const verticalLineY = parentY + 80; // Vertical line down from parents
        const horizontalLineY = childY - 80; // Horizontal line above children

        // 1. Vertical line from parent center down
        connections.push({
          id: `family-vertical-${connectionId++}`,
          fromPersonId: `vertical-${family.name}`,
          toPersonId: `vertical-${family.name}`,
          type: 'family-line',
          points: [
            { x: parentCenterX, y: parentY + 35 },
            { x: parentCenterX, y: horizontalLineY }
          ]
        });

        // 2. Horizontal line connecting all children positions
        connections.push({
          id: `family-horizontal-${connectionId++}`,
          fromPersonId: `horizontal-${family.name}`,
          toPersonId: `horizontal-${family.name}`,
          type: 'family-line',
          points: [
            { x: minChildX, y: horizontalLineY },
            { x: maxChildX, y: horizontalLineY }
          ]
        });

        // 3. Vertical lines from horizontal line down to each child
        family.children.forEach((childInfo) => {
          const child = findPersonByName(childInfo.firstName, childInfo.lastName);
          if (child) {
            connections.push({
              id: `family-child-${connectionId++}`,
              fromPersonId: `child-${child.id}`,
              toPersonId: child.id,
              type: 'family-line',
              points: [
                { x: childInfo.x, y: horizontalLineY },
                { x: childInfo.x, y: childY - 35 }
              ]
            });
          }
        });
      }
    });

    // Add married couples and their unique children
    marriedCouples.forEach((couple) => {
      // Add spouses (only if not already added)
      couple.parents.forEach((parentInfo) => {
        const person = findPersonByName(parentInfo.firstName, parentInfo.lastName);
        if (person && !addedPeople.has(person.id)) {
          nodes.push({
            ...person,
            position: { x: parentInfo.x, y: parentInfo.y },
            generation: 2,
            familyGroup: couple.name
          });
          addedPeople.add(person.id);
        }
      });

      // Add children
      couple.children.forEach((childInfo) => {
        const person = findPersonByName(childInfo.firstName, childInfo.lastName);
        if (person && !addedPeople.has(person.id)) {
          nodes.push({
            ...person,
            position: { x: childInfo.x, y: childInfo.y },
            generation: 3,
            familyGroup: couple.name
          });
          addedPeople.add(person.id);
        }
      });

      // Create spouse connection
      if (couple.parents.length === 2) {
        const parent1 = findPersonByName(couple.parents[0].firstName, couple.parents[0].lastName);
        const parent2 = findPersonByName(couple.parents[1].firstName, couple.parents[1].lastName);
        if (parent1 && parent2) {
          connections.push({
            id: `spouse-${connectionId++}`,
            fromPersonId: parent1.id,
            toPersonId: parent2.id,
            type: 'spouse'
          });
        }
      }

      // Create T-shaped parent-child connections for couple's children
      if (couple.children.length > 0) {
        const parentCenterX = (couple.parents[0].x + couple.parents[1].x) / 2;
        const parentY = couple.parents[0].y;

        const minChildX = Math.min(...couple.children.map(c => c.x));
        const maxChildX = Math.max(...couple.children.map(c => c.x));
        const childY = couple.children[0].y;

        const horizontalLineY = childY - 80; // Horizontal line above children

        // 1. Vertical line from parent center down
        connections.push({
          id: `couple-vertical-${connectionId++}`,
          fromPersonId: `couple-vertical-${couple.name}`,
          toPersonId: `couple-vertical-${couple.name}`,
          type: 'family-line',
          points: [
            { x: parentCenterX, y: parentY + 35 },
            { x: parentCenterX, y: horizontalLineY }
          ]
        });

        // 2. Horizontal line connecting all children positions
        connections.push({
          id: `couple-horizontal-${connectionId++}`,
          fromPersonId: `couple-horizontal-${couple.name}`,
          toPersonId: `couple-horizontal-${couple.name}`,
          type: 'family-line',
          points: [
            { x: minChildX, y: horizontalLineY },
            { x: maxChildX, y: horizontalLineY }
          ]
        });

        // 3. Vertical lines from horizontal line down to each child
        couple.children.forEach((childInfo) => {
          const child = findPersonByName(childInfo.firstName, childInfo.lastName);
          if (child) {
            connections.push({
              id: `couple-child-${connectionId++}`,
              fromPersonId: `couple-child-${child.id}`,
              toPersonId: child.id,
              type: 'family-line',
              points: [
                { x: childInfo.x, y: horizontalLineY },
                { x: childInfo.x, y: childY - 35 }
              ]
            });
          }
        });
      }
    });

    // Add any remaining people not in defined families
    const remainingPeople = people.filter(p => !addedPeople.has(p.id));
    remainingPeople.forEach((person, index) => {
      nodes.push({
        ...person,
        position: {
          x: 200 + (index % 4) * 200,
          y: 750 + Math.floor(index / 4) * 150
        },
        generation: 4,
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
    if (connection.type === 'spouse') {
      const fromNode = nodes.find(n => n.id === connection.fromPersonId);
      const toNode = nodes.find(n => n.id === connection.toPersonId);

      if (fromNode && toNode) {
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
    }

    if (connection.type === 'family-line' && connection.points && connection.points.length >= 2) {
      const points = connection.points;

      return (
        <line
          key={connection.id}
          x1={points[0].x}
          y1={points[0].y}
          x2={points[1].x}
          y2={points[1].y}
          stroke="#f5f5dc"
          strokeWidth="3"
        />
      );
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
          viewBox="0 0 2200 1000"
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