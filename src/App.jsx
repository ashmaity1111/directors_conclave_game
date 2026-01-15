import { useState } from 'react';
import './App.css'
import DirectorMatchingModal from './components/DirectorMatchingModal';

function App() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div>
        Dashboard
        <button onClick={() => setOpen(true)}>
        Open Director Matching
      </button>

      {open && <DirectorMatchingModal onClose={() => setOpen(false)} />}
      </div>
    </>
  )
}

export default App
