import { Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';// <-- Import the new page

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<AuthPage/>} />
        <Route path="/" element={<Dashboard/>} />
        
        
        <Route path="/board/:id" element={<BoardView/>} /> 
      </Routes>
    </div>
  );
}

export default App;