import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegisterPage from './app/views/RegisterPage';
import { Toaster } from './components/ui/sonner';

const router = createBrowserRouter([
  { path: '/', element: <RegisterPage /> },
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
