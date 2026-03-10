/*import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [count, setCount] = useState(0)
  const [array, setArray] = useState<string[]>([])

  const fetchAPI = async () => {
    const response = await axios.get("http://localhost:8080/api");
    setArray(response.data.fruits);
    console.log(response.data.fruits);
  }

  useEffect(() => {
    fetchAPI();
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
import CoachDashboardView from './modules/CoachDashboardView'

function App() {
  return <CoachDashboardView />
}
export default App



import PlayerProfileView from './modules/PlayerProfileView'

function App() {
  return <PlayerProfileView />
}
export default App

import SignUpView from './modules/SignUpView'

function App() {
  return <SignUpView />
}
export default App



import LoginView from './modules/LoginView'

function App() {
  return <LoginView />
}
export default App
*/

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SignUpView from './modules/SignUpView'
import LoginView from './modules/LoginView'
import PlayerProfileView from './modules/PlayerProfileView'
import CoachDashboardView from './modules/CoachDashboardView'
import GeneralView from './modules/GeneralView'
import RegistrationView from './modules/RegistrationView'

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
        <Route path="/player" element={<PlayerProfileView />} />
        <Route path="/coach" element={<CoachDashboardView />} />
        <Route path="/general" element={<GeneralView />} />
        <Route path="/registrations" element={<RegistrationView />} />

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App