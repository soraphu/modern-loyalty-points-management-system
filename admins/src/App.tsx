import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { Button } from './components/ui/button';

const router = createBrowserRouter([
  { path: '/', element: <Button /> },
]);

function App() {

  return (
    <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App
