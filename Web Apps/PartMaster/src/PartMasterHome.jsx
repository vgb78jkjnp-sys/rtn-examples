import PartMasterLayout from './components/PartMasterLayout';
import './App.css';

function PartMasterHome() {
  return (
    <PartMasterLayout title="Part Master" resultsLayout>
      <div
        className="d-flex align-items-center justify-content-center text-muted w-100"
        style={{ flex: 1, minHeight: 0 }}
      >
        Select a page from the menu.
      </div>
    </PartMasterLayout>
  );
}

export default PartMasterHome;
