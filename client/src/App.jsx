import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUpView from './views/SignUpView'
import LoginView from './views/LoginView'
import PlayerProfileView from './views/PlayerProfileView'
import CoachDashboardView from './views/CoachDashboardView'
import GeneralView from './views/GeneralView'
import RegistrationView from './views/RegistrationView'
import TeamSearchView from './views/TeamSearchView'
import PendingRequestsView from './views/PendingRequestsView'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpView />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignUpView />} />
        <Route path="/general" element={<GeneralView />} />
        <Route path="/player" element={<PlayerProfileView />} />
        <Route path="/coach" element={<CoachDashboardView />} />
        <Route path="/registrations" element={<RegistrationView />} />
        <Route path="/search" element={<TeamSearchView />} />
        <Route path="/pending" element={<PendingRequestsView />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
