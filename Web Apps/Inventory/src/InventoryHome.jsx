import InventoryLayout from './components/InventoryLayout';
import './App.css';

function InventoryHome() {
  return (
    <InventoryLayout title="Inventory" resultsLayout>
      <div
        className="d-flex align-items-center justify-content-center text-muted w-100"
        style={{ flex: 1, minHeight: 0 }}
      >
        Select a page from the menu.
      </div>
    </InventoryLayout>
  );
}

export default InventoryHome;
