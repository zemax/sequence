import { useEffect } from "react";
import { Provider } from "react-redux";
import { HashRouter, Route, Routes } from "react-router";
import { getSerwist } from "virtual:serwist";
import store from "./data/store";
import { HomePage } from "./routes/HomePage";
import { SequenceCreatePage } from "./routes/SequenceCreatePage";
import { SequenceEditPage } from "./routes/SequenceEditPage";
import { SequenceViewPage } from "./routes/SequenceViewPage";
import { SettingsPage } from "./routes/SettingsPage";

export const App = () => {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    getSerwist().then((serwist) => serwist?.register());
  }, []);

  return (
    <Provider store={store}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sequence/create" element={<SequenceCreatePage />} />
          <Route path="/sequence/edit/:id" element={<SequenceEditPage />} />
          <Route path="/sequence/view/:id" element={<SequenceViewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </HashRouter>
    </Provider>
  );
};
