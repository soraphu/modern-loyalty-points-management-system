import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './app/views/HomePage';
import QrScannerPage from './app/views/QrScannerPage';
import EarningPointsPage from './app/views/EarningPointsPage';
import { AvailableRewardsPage } from './app/views/AvailableRewardsPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/scanner', element: <QrScannerPage /> },
  { path: '/earning-points', element: <EarningPointsPage /> },
  { path: '/available-rewards', element: <AvailableRewardsPage /> },
]);

function App() {
  return (
    <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App