import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

// Import your global Tailwind CSS theme
import "./styles.css";

// Import the router engine
import { getRouter } from "./router";

// NEW: Import the AuthProvider and hook
import { AuthProvider, useAuth } from "./context/AuthContext";

// Initialize the router
const router = getRouter();

// Register the router instance for strict TypeScript type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// NEW: Create an App wrapper.
// TanStack Router needs the auth state passed into its context prop to run the beforeLoad gates.
function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

// Find the root HTML element
const rootElement = document.getElementById("root")!;

// Render the application
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      {/* NEW: Wrap the entire app in the AuthProvider so the context exists */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </React.StrictMode>
  );
}