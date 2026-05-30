import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegisterPage from './app/views/RegisterPage';
import { Toaster } from './components/ui/sonner';
import LoginPage from './app/views/LoginPage';
import HomePage from './app/views/HomePage';

const router = createBrowserRouter([
  { path: '/', element: <RegisterPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/home', element: <HomePage /> },
]);

function App() {

  return (
    <main>
      <RouterProvider router={router} />
      <Toaster />
    </main>
  )
}

export default App
