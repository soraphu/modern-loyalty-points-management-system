import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegisterPage from './app/views/RegisterPage';
import { Toaster } from './components/ui/sonner';
import LoginPage from './app/views/LoginPage';
import HomePage from './app/views/HomePage';
import RewardsPage from './app/views/RewardPage';
import AllTransactionsPage from './app/views/AllTransactionsPage';
import ExecutedTransactionsPage from './app/views/ExecutedTransactionsPage';
import ManageCustomersPage from './app/views/ManageCustomersPage';
import ManageAdminPage from './app/views/ManageAdminPage';

const router = createBrowserRouter([
  { path: '/', element: <RegisterPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/home', element: <HomePage /> },
  { path: '/rewards', element: <RewardsPage /> },
  { path: '/executed-transactions', element: <ExecutedTransactionsPage /> },
  { path: '/transactions', element: <AllTransactionsPage /> },
  { path: '/manage-customers', element: <ManageCustomersPage /> },
  { path: '/manage-admins', element: <ManageAdminPage /> },
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
