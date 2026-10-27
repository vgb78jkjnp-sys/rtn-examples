import { useState } from 'react';
import { ListGroup, Collapse } from 'react-bootstrap';
//import 'bootstrap/dist/css/min.css';
//import 'bootstrap-icons/font/bootstrap-icons.css'; // Optional: for icons

const defaultTreeData = [
  /* {
    id: "1",
    label: "Documents",
    children: [
      { id: "1-1", label: "Resume.pdf" },
      { id: "1-2", label: "Project_Proposal.docx" }
    ]
  },
  {
    id: "2",
    label: "Pictures",
    children: [
      {
        id: "2-1",
        label: "Vacation_2026",
        children: [
          { id: "2-1-1", label: "Beach.png" },
          { id: "2-1-2", label: "Mountain.jpg" }
        ]
      },
      { id: "2-2", label: "Profile_Pic.jpg" }
    ]
  },
  {
    id: "3",
    label: "Config.json"
  } */
];

const TreeNode = ({ node, onNodeClick, selectedId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleNodeClick = () => {
    onNodeClick(node);
  };

  return (
    <ListGroup.Item 
      className="border-0 p-1 ps-2 bg-transparent"
      style={{ userSelect: 'none' }}
    >
      <div 
        className={`d-flex align-items-center cursor-pointer ${selectedId === node.id ? 'fw-bold' : 'text-dark'}`}
        onClick={handleNodeClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Expand / Collapse Icon */}
        <span onClick={handleToggle} className="me-2 text-secondary" style={{ width: '20px', textAlign: 'center' }}>
          {hasChildren && (
            <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`} />
          )}
        </span>

        {/* Node Type Icon */}
        <span className="me-2">
          <i className={`bi ${hasChildren ? (isExpanded ? 'bi-folder2-open' : 'bi-folder2') : 'bi-file-earmark'}`} />
        </span>

        {/* Display Text */}
        <span className="flex-grow-1">{node.label}</span>
      </div>

      {/* Recursive Children Rendering */}
      {hasChildren && (
        <Collapse in={isExpanded}>
          <div>
            <ListGroup className="border-0 bg-transparent" style={{ fontSize: '0.85rem' }}>
              {node.children.map((child) => (
                <TreeNode 
                  key={child.id} 
                  node={child} 
                  onNodeClick={onNodeClick} 
                  selectedId={selectedId}
                />
              ))}
            </ListGroup>
          </div>
        </Collapse>
      )}
    </ListGroup.Item>
  );
};

export const RouteSearchTreeView = ({ data = defaultTreeData, title = "Project Hierarchy", showSelectionSummary = false, onSelect }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    if (typeof onSelect === 'function') {
      onSelect(node);
    }
  };

  return (
    <div className="p-0">      
      <ListGroup className="border-0 bg-transparent" style={{ fontSize: '0.9rem' }}>
        {data.map((rootNode) => (
          <TreeNode 
            key={rootNode.id} 
            node={rootNode} 
            onNodeClick={handleNodeSelect}
            selectedId={selectedNode?.id}
          />
        ))}
      </ListGroup>
      {showSelectionSummary && selectedNode && (
        <div className="mt-3 p-2 bg-white border rounded small">
          <strong>Selected ID:</strong> {selectedNode.id}
        </div>
      )}
    </div>
  );
};

export default RouteSearchTreeView;