import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RegisterPage from './app/views/RegisterPage';

const router = createBrowserRouter([
  { path: '/', element: <RegisterPage /> },
]);

function App() {

  return (
    <main>
      <RouterProvider router={router} />
    </main>
  )
}

export default App
