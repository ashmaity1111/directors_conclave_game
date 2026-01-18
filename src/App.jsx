import { useState } from 'react';
import './App.css'
import DirectorMatchingModal from './components/DirectorMatchingModal';
import ChallengeResultModal from './components/ChallengeResultModal';

function App() {
   const [openMatching, setOpenMatching] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [resultData, setResultData] = useState(null);

  const handleGameComplete = (data) => {
    setResultData(data);
    setOpenMatching(false);
    setOpenResult(true);
  };

  return (
    <>
      <div>
        Dashboard
       <button onClick={() => setOpenMatching(true)}>
        Open Director Matching
      </button>

      {openMatching && (
        <DirectorMatchingModal
          onClose={() => setOpenMatching(false)}
          onComplete={handleGameComplete}
        />
      )}

      {openResult && (
        <ChallengeResultModal
          data={resultData}
          onClose={() => setOpenResult(false)}
        />
      )}
      </div>
    </>
  )
}

export default App
