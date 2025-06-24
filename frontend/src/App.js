import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashBoard from './pages/DashBoard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>

          <Route path='/login' element={<Login/>}/>

          <Route element={<ProtectRoute/>}>
            <Route path='/' element={<DashBoard/>}/>
          </Route>
          
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
