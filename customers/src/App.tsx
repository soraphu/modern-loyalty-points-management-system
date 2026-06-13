import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './app/views/HomePage';
import QrScannerPage from './app/views/QrScannerPage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/scanner', element: <QrScannerPage /> },
]);

function App() {
  return (
    <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App