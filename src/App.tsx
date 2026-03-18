import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingCodigoDaAbundancia from './pages/LandingCodigoDaAbundancia';
import AbundanciaObrigado from './pages/AbundanciaObrigado';
import AbundanciaErro from './pages/AbundanciaErro';
import { initMetaPixel } from './lib/meta';

function App() {
  useEffect(() => {
    initMetaPixel();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingCodigoDaAbundancia />} />
      <Route path="/landing/codigo-da-abundancia" element={<LandingCodigoDaAbundancia />} />
      <Route path="/abundancia/obrigado" element={<AbundanciaObrigado />} />
      <Route path="/abundancia/erro" element={<AbundanciaErro />} />
    </Routes>
  );
}

export default App;
