import React from "react";
import { Route, Routes } from "react-router-dom";
import GetUPRN from "./components/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<GetUPRN />} />
    </Routes>
  );
}

export default App;