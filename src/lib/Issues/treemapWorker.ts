/// worker.ts
import type { Node, Issue } from "../../types/collection";

type HierarchyNode = {
  id: number;
  name: string;
  parent_id: number | null;
  children: HierarchyNode[];
  value?: number;
  state?: string;
};

function buildHierarchy(nodes: Node[], issues: Issue[]) {
  const nodeMap = new Map<number, Node>();
  const hierarchyMap = new Map<number, HierarchyNode>();

  nodes.forEach(node => {
    nodeMap.set(node.id, node);
  });

  function createHierarchyNode(node: Node): HierarchyNode {
    return {
      id: node.id,
      name: node.name,
      parent_id: node.parent_id,
      children: []
    };
  }

  function addNodePath(issue: Issue) {
    let currentNodeId = issue.node_id;
    let childHierarchyNode: HierarchyNode | null = {
      id: issue.id,
      name: issue.name,
      parent_id: currentNodeId,
      children: [],
      value: 10,
      state: issue.state
    };

    while (currentNodeId !== null) {
      const currentNode = nodeMap.get(currentNodeId);
      if (!currentNode) break;

      if (hierarchyMap.has(currentNodeId)) {
        const existingNode = hierarchyMap.get(currentNodeId)!;
        if (childHierarchyNode) {
          existingNode.children.push(childHierarchyNode);
        }
        break;
      }

      const newHierarchyNode = createHierarchyNode(currentNode);
      if (childHierarchyNode) {
        newHierarchyNode.children.push(childHierarchyNode);
      }

      hierarchyMap.set(currentNodeId, newHierarchyNode);
      childHierarchyNode = newHierarchyNode;
      currentNodeId = currentNode.parent_id;
    }
  }

  issues.forEach(issue => {
    if (nodeMap.has(issue.node_id)) {
      addNodePath(issue);
    }
  });

  const rootNode = nodes.find(node => node.parent_id === null);
  if (!rootNode) {
    throw new Error("No root node found");
  }

  updateNodeValues(hierarchyMap.get(rootNode.id)!);
  return hierarchyMap.get(rootNode.id)!;
}

function updateNodeValues(node: HierarchyNode, depth: number = 0): void {
  if (node.value !== undefined) {
    node.value -= depth * 0.5;
  }
  for (const child of node.children) {
    updateNodeValues(child, depth + 1);
  }
}

self.onmessage = function (event) {
  const { nodes, issues } = event.data;
  const hierarchy = buildHierarchy(nodes, issues);
  self.postMessage(hierarchy);
};
