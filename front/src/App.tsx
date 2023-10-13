import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Game from './views/Game';
import Home from './views/Home';
import Race from './views/Race';
import './assets/styles/App.scss';
import AnimatedRoutes from './components/AnimatedRoutes';

function App() {
  return (
    <Router>
      <AnimatedRoutes/>
    </Router>
  );
}

export default App;
