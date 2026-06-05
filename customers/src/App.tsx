import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/views/HomePage';

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
]);

function App() {
  return (
    <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App