import { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router";
import { getSerwist } from "virtual:serwist";
import { basePath } from "./data/basePath";
import store from "./data/store";
import { HomePage } from "./routes/HomePage";
import { SequenceCreatePage } from "./routes/SequenceCreatePage";
import { SequenceEditPage } from "./routes/SequenceEditPage";
import { SequenceViewPage } from "./routes/SequenceViewPage";

export const App = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    getSerwist().then((serwist) => serwist?.register());
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter basename={basePath}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sequence/create" element={<SequenceCreatePage />} />
          <Route path="/sequence/edit" element={<SequenceEditPage />} />
          <Route path="/sequence/view" element={<SequenceViewPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};
