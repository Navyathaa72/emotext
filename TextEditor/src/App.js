import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import logo from "./logo.svg";
import TextEditor from "./components/TextEditor";
import  ViewSavedPage  from  "./components/ViewSavedPage";
import  ViewSavedEditor  from "./components/ViewSavedEditor"; // Import ViewSavedEditor

import "./App.css";

function App() {
  const [savedData, setSavedData] = useState([]);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>EMOTEXT</h1>
        </header>
        <Routes>
          <Route path="/" element={<HomePage savedData={savedData} setSavedData={setSavedData} />} />
          <Route
            path="/view-saved"
            element={<ViewSavedPage savedData={savedData} />}
          />
          <Route
            path="/view/:id"
            element={<ViewSavedEditor />} // Render ViewSavedEditor when /view/:id is accessed
          />
        </Routes>
      </div>
    </Router>
  );
}

function HomePage({ savedData, setSavedData }) {
  return (
    <div>
      <Link to="/view-saved" className="view-saved-button">
        View Saved
      </Link>
      <div className="editor">
        <TextEditor savedData={savedData} setSavedData={setSavedData} />
      </div>
    </div>
  );
}

export default App;