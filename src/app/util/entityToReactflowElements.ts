import { Node, Edge } from "reactflow";
import { Entity } from "../../ERDoc/types/parser/Entity";

type EntityNode = Node<
  {
    label: string;
    isWeak: boolean;
  },
  "entity"
>;

type EntityAttributeNode = Node<
  {
    label: string;
    isKey: boolean;
    entityIsWeak: boolean;
  },
  "entity-attribute"
>;

type CompositeAttributeNode = Node<{ label: string }, "composite-attribute">;

type EntityEdge = Edge<{ cardinality: string; isTotalParticipation: boolean }>;

export const entityToReactflowElements = (
  entity: Entity,
): [
  (EntityNode | EntityAttributeNode | CompositeAttributeNode)[],
  EntityEdge[],
] => {
  const entityNodes: EntityNode[] = [];
  const attributeNodes: EntityAttributeNode[] = [];
  const compositeAttributeNodes: CompositeAttributeNode[] = [];
  const attributeEdges: Edge[] = [];

  const entID = `entity: ${entity.name}`;
  entityNodes.push({
    id: entID,
    type: "entity",
    data: { label: entity.name, isWeak: entity.hasDependencies },
    position: {
      x: 500,
      y: 150,
    },
  });

  // create attr nodes and an edge to the entity
  let xOffSet = -70;

  for (const attr of entity.attributes) {
    const attrID = `entity-attr: ${entity.name}|${attr.name}`;
    attributeNodes.push({
      id: attrID,
      type: "entity-attribute",
      data: {
        label: attr.name,
        isKey: attr.isKey,
        entityIsWeak: entity.hasDependencies,
      },
      parentNode: entID,
      position: { x: xOffSet, y: 100 },
    });

    attributeEdges.push({
      id: `entity-attr: ${entity.name}->${attr.name}`,
      source: attrID,
      target: entID,
      sourceHandle: "l",
      targetHandle: "r",
      type: "erEdge",
    });
    xOffSet += 70;

    // if the attribute is composite, create nodes and edges for its components
    if (!attr.isComposite) continue;
    let childXOffset = 100;
    for (const childAttrName of attr.childAttributesNames!) {
      const childAttrID = `entity-attr-composite: ${entity.name}|${attr.name}|${childAttrName}`;
      compositeAttributeNodes.push({
        id: childAttrID,
        type: "composite-attribute",
        data: { label: childAttrName },
        parentNode: entID,
        position: { x: childXOffset, y: 200 },
      });
      attributeEdges.push({
        id: `entity-attr-composite: ${entity.name} ${attr.name}->${childAttrName}`,
        source: childAttrID,
        target: attrID,
        sourceHandle: "l",
        targetHandle: "r",
        type: "erEdge",
      });
      childXOffset += 100;
    }
  }

  return [
    [...entityNodes, ...attributeNodes, ...compositeAttributeNodes],
    attributeEdges,
  ];
};
