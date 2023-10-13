import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Game from './views/Game';
import Home from './views/Home';
import Race from './views/Race';
import './assets/styles/App.scss';

function App() {
  return (
    <Router>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/race" element={<Race />} />
        </Routes>
    </Router>
  );
}

export default App;
