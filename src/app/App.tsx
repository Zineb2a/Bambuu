import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import ChartWrapper from './components/ChartWrapper';

export default function App() {
  // Apply dark mode on app load
  useEffect(() => {
    const darkMode = localStorage.getItem("darkMode") === "true";
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <ChartWrapper>
      <RouterProvider router={router} />
    </ChartWrapper>
  );
}