import { useCallback, useState } from 'react';

function PartAssemblyTreeNode({
  node,
  depth,
  selectedNodeId,
  onSelect,
  defaultExpanded
}) {
  const hasChildren = node.children?.length > 0;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isSelected = selectedNodeId === node.id;
  const isSelectablePart = node.nodeType === 'part';

  const handleRowClick = () => {
    if (isSelectablePart) {
      onSelect(node);
    } else if (hasChildren) {
      setExpanded((prev) => !prev);
    }
  };

  const handleChevronClick = (event) => {
    event.stopPropagation();
    if (hasChildren) {
      setExpanded((prev) => !prev);
    }
  };

  return (
    <div className="part-assembly-tree-node">
      <div
        className={[
          'part-assembly-tree-row',
          isSelected ? 'part-assembly-tree-row-selected' : '',
          isSelectablePart ? 'part-assembly-tree-row-part' : 'part-assembly-tree-row-container'
        ].filter(Boolean).join(' ')}
        style={{ paddingLeft: `${depth * 1.1 + 0.25}rem` }}
        onClick={handleRowClick}
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
        aria-selected={isSelectablePart ? isSelected : undefined}
      >
        <button
          type="button"
          className="part-assembly-tree-chevron-btn"
          onClick={handleChevronClick}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          tabIndex={-1}
          disabled={!hasChildren}
        >
          {hasChildren ? (
            <i
              className={`bi ${expanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}
              aria-hidden="true"
            />
          ) : (
            <span className="part-assembly-tree-chevron-spacer" aria-hidden="true" />
          )}
        </button>
        <span className="part-assembly-tree-label">{node.label}</span>
      </div>
      {hasChildren && expanded && (
        <div role="group">
          {node.children.map((child) => (
            <PartAssemblyTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              defaultExpanded
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PartAssemblyTree({ root, selectedNodeId, onSelectNode, hasSearched, treeKey }) {
  const handleSelect = useCallback(
    (node) => {
      onSelectNode(node);
    },
    [onSelectNode]
  );

  if (!hasSearched) {
    return (
      <div className="part-assembly-tree-empty text-muted">
        Enter a serial mask and search to load assemblies.
      </div>
    );
  }

  if (!root || root.children.length === 0) {
    return (
      <div className="part-assembly-tree-empty text-muted">
        No assembly rows matched the mask(s).
      </div>
    );
  }

  return (
    <div className="part-assembly-tree-panel" role="tree" key={treeKey}>
      <PartAssemblyTreeNode
        node={root}
        depth={0}
        selectedNodeId={selectedNodeId}
        onSelect={handleSelect}
        defaultExpanded
      />
    </div>
  );
}

export default PartAssemblyTree;
