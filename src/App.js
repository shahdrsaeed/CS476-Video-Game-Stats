import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GeneralView from './modules/GeneralView';
import RegistrationView from './modules/RegistrationView';
import TeamSearchView from './modules/TeamSearchView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GeneralView />} />
        <Route path="/registration" element={<RegistrationView />} />
        <Route path="/search" element={<TeamSearchView />} />
      </Routes>
    </Router>
  );
}

export default App;