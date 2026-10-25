import { useMemo, useState } from 'react';

import PartMasterLayout from './components/PartMasterLayout';
import PartAssemblySidebar from './components/PartAssemblySidebar';
import PartAssemblyTree from './components/PartAssemblyTree';
import PartAssemblyDetail from './components/PartAssemblyDetail';
import MfgAlert from './components/MfgAlert';
import { invokeApi } from './utils/invokeApi';
import { parsePartAssemblySerialMask } from './utils/parsePartAssemblyMasks';
import {
  parsePartAssemblyDetailResponse,
  parsePartAssemblyTreeResponse
} from './utils/parsePartAssemblyResponse';
import { buildPartAssemblyTreeRoot } from './utils/buildPartAssemblyTree';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';

function PartAssembly() {
  const [serialMask, setSerialMask] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [treeRoot, setTreeRoot] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', variant: 'success' });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [treeKey, setTreeKey] = useState(0);

  const isSidebarOpen = !isExpanded && !isSidebarCollapsed;

  const { invoke: invokeGetTree } = invokeApi('POST', '/api/partservice/GETPARTASSEMBLYTREEBYVENDORLOT');
  const { invoke: invokeGetDetail } = invokeApi('POST', '/api/partservice/GETPARTASSEMBLYPARTDETAIL');

  const statusText = useMemo(() => {
    if (!hasSearched) {
      return 'No search run yet';
    }
    return `${rowCount} row${rowCount === 1 ? '' : 's'}`;
  }, [hasSearched, rowCount]);

  const handleSearch = async () => {
    const { vendorLot, error } = parsePartAssemblySerialMask(serialMask);
    if (error) {
      setAlert({ message: error, variant: 'danger' });
      return;
    }

    setLoading(true);
    setAlert({ message: '', variant: 'success' });
    setSelectedNodeId('');
    setSelectedNode(null);
    setDetail(null);

    try {
      const data = await invokeGetTree({ VendorLot: vendorLot });
      const rows = parsePartAssemblyTreeResponse(data);
      setRowCount(rows.length);
      setTreeRoot(buildPartAssemblyTreeRoot(rows));
      setTreeKey((key) => key + 1);
      setHasSearched(true);

      if (rows.length === 0) {
        setAlert({ message: 'No assembly rows matched the serial mask.', variant: 'warning' });
      }
    } catch (err) {
      setRowCount(0);
      setTreeRoot(buildPartAssemblyTreeRoot([]));
      setHasSearched(true);
      setAlert({ message: err?.message || 'Unable to load assembly tree.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSerialMask('');
    setHasSearched(false);
    setTreeRoot(null);
    setRowCount(0);
    setSelectedNodeId('');
    setSelectedNode(null);
    setDetail(null);
    setAlert({ message: '', variant: 'success' });
  };

  const handleSelectNode = async (node) => {
    if (node.nodeType !== 'part') {
      return;
    }

    setSelectedNodeId(node.id);
    setSelectedNode(node);
    setDetailLoading(true);

    try {
      const data = await invokeGetDetail({
        PartId: node.partId,
        ParentPartId: node.parentPartId ?? ''
      });
      setDetail(parsePartAssemblyDetailResponse(data));
    } catch (err) {
      setDetail(null);
      setAlert({ message: err?.message || 'Unable to load part detail.', variant: 'danger' });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <PartMasterLayout title="Part Assembly" isExpanded={isExpanded} resultsLayout>
      {loading && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.55)',
            zIndex: 2000
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <MfgAlert
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ message: '', variant: 'success' })}
      />

      <div className={`container-fluid results-shell ${isExpanded ? 'results-expanded' : ''}`}>
        <div className="row results-row g-0">
          {!isExpanded && isSidebarCollapsed && (
            <div className="results-sidebar-rail">
              <button
                type="button"
                className="btn btn-link results-sidebar-toggle"
                onClick={() => setIsSidebarCollapsed(false)}
                aria-label="Show filters panel"
                title="Show filters"
              >
                <i className="bi bi-layout-sidebar" aria-hidden="true" />
              </button>
            </div>
          )}

          {isSidebarOpen && (
            <PartAssemblySidebar
              serialMask={serialMask}
              statusText={statusText}
              loading={loading}
              onSerialMaskChange={(event) => setSerialMask(event.target.value)}
              onSearch={handleSearch}
              onReset={handleReset}
              onHide={() => setIsSidebarCollapsed(true)}
            />
          )}

          <div
            className={`runs-list ${isExpanded || isSidebarCollapsed ? 'runs-list-full' : 'col-10'}`}
          >
            <div
              className="mb-1 d-flex align-items-center justify-content-between"
              style={{ fontWeight: 500, fontSize: '1.0rem' }}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-diagram-3 me-2" aria-hidden="true" style={{ fontSize: '1.3em' }} />
                Part Assembly
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-link results-expand-toggle"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? 'Restore results area' : 'Expand results area'}
                  title={isExpanded ? 'Restore' : 'Expand'}
                >
                  <i className={`fa ${isExpanded ? 'fa-compress' : 'fa-expand'}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="part-assembly-split">
              <PartAssemblyTree
                root={treeRoot}
                hasSearched={hasSearched}
                treeKey={treeKey}
                selectedNodeId={selectedNodeId}
                onSelectNode={handleSelectNode}
              />
              <PartAssemblyDetail
                detail={detail}
                loading={detailLoading}
                selectedLabel={selectedNode?.label}
              />
            </div>
          </div>
        </div>
      </div>
    </PartMasterLayout>
  );
}

export default PartAssembly;
