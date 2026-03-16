import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingCodigoDaAbundancia from './pages/LandingCodigoDaAbundancia';
import { initMetaPixel } from './lib/meta';

function App() {
  useEffect(() => {
    initMetaPixel();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingCodigoDaAbundancia />} />
      <Route path="/landing/codigo-da-abundancia" element={<LandingCodigoDaAbundancia />} />
    </Routes>
  );
}

export default App;
