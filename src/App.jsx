// src/App.js

import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "./utils/routes";
import MainLayout from "./layout/mainLayout";
import NotFoundPage from "./page/common/NotFoundPage";
import Loader from "./components/common/Loader";

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          {routes.map((route, index) => {
            const { path, component: Component, module } = route;

            // Admin routes (with layout)
            if (module === "admin") {
              return (
                <Route
                  key={index}
                  path={path}
                  element={
                    <MainLayout>
                      <Component />
                    </MainLayout>
                  }
                />
              );
            }

            // Auth routes (no layout)
            if (module === "auth") {
              return (
                <Route
                  key={index}
                  path={path}
                  element={<Component />}
                />
              );
            }

            return null;
          })}

          <Route path="/notfound" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;