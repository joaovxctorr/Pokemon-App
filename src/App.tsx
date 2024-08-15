import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PokemonCard from './components/PokemonCard';
import PokeQuiz from './pages/pokeQuiz';
import Pokedex from './pages/pokedex';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PokemonCard name="pikachu" />} />
        <Route path="/pokequiz" element={<PokeQuiz />} />
        <Route path="/pokedex" element={<Pokedex />} />
      </Routes>
    </Router>
  );
};

export default App;
