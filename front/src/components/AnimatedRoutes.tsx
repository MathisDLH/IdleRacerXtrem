import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Home from '../views/Home';
import Game from '../views/Game';
import Race from '../views/Race';
import {AnimatePresence} from 'framer-motion';

const AnimatedRoutes = () => {
    const location = useLocation();

  return (
    <AnimatePresence>
    <Routes location={location} key={location.pathname}>
    <Route path="/" element={<Home />} />
    <Route path="/game" element={<Game />} />
    <Route path="/race" element={<Race />} />
    </Routes>
    </AnimatePresence>
  );
}

export default AnimatedRoutes;
