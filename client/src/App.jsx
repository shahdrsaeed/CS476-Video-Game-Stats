import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUpView from './views/SignUpView'
import LoginView from './views/LoginView'
import PlayerProfileView from './views/PlayerProfileView'
import CoachDashboardView from './views/CoachDashboardView'
import GeneralView from './views/GeneralView'
import RegistrationView from './views/RegistrationView'
import TeamSearchView from './views/TeamSearchView'

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