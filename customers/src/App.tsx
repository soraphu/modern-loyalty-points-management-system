import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from './pages/Home';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
]);

function App() {

  return (
    <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App
