import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './app/views/HomePage';
import QrScannerPage from './app/views/QrScannerPage';
import EarnPointsPage from './app/views/EarnPointsPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/scanner', element: <QrScannerPage /> },
  { path: '/earn-points', element: <EarnPointsPage /> },
]);

function App() {
  return (
    <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App