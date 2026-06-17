import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RoomPage from './pages/RoomPage';
import { theme } from './theme';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NotificationProvider>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/room" element={<Navigate to="/" replace />} />
              <Route path="/room/:roomId" element={<RoomPage />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
