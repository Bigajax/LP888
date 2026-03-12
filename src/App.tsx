import { Routes, Route } from 'react-router-dom';
import LandingCodigoDaAbundancia from './pages/LandingCodigoDaAbundancia';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingCodigoDaAbundancia />} />
      <Route path="/landing/codigo-da-abundancia" element={<LandingCodigoDaAbundancia />} />
    </Routes>
  );
}

export default App;
