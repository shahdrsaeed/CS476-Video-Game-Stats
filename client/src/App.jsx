import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUpView from './modules/SignUpView'
import LoginView from './modules/LoginView'
import PlayerProfileView from './modules/PlayerProfileView'
import CoachDashboardView from './modules/CoachDashboardView'
import GeneralView from './modules/GeneralView'
import RegistrationView from './modules/RegistrationView'
import TeamSearchView from './modules/TeamSearchView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default → Sign Up */}
        <Route path="/" element={<SignUpView />} />

        {/* Auth pages */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignUpView />} />

        {/* Dashboard pages */}
        <Route path="/general" element={<GeneralView />} />
        <Route path="/player" element={<PlayerProfileView />} />
        <Route path="/coach" element={<CoachDashboardView />} />
        <Route path="/registrations" element={<RegistrationView />} />
        <Route path="/search" element={<TeamSearchView />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App