import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import StudioPage from "./pages/StudioPage";
import ResultsPage from "./pages/ResultsPage";

import {
  AudioProjectProvider,
} from "./context/AudioProjectContext";

export default function App() {
  return (
    <BrowserRouter>
      <AudioProjectProvider>
        <Routes>
          <Route
            path="/"
            element={
              <StudioPage />
            }
          />

          <Route
            path="/results"
            element={
              <ResultsPage />
            }
          />
        </Routes>
      </AudioProjectProvider>
    </BrowserRouter>
  );
}
