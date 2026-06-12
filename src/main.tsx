import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { useRecordsStore } from './store/useRecordsStore';
import { useSnapshotStore } from './store/useSnapshotStore';
import './index.css';

function Root() {
  const hydrateFromStorage = useRecordsStore((s) => s.hydrateFromStorage);
  const hydrateSnapshots = useSnapshotStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
    hydrateSnapshots();
  }, [hydrateFromStorage, hydrateSnapshots]);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
