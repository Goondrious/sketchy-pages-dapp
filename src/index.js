import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Pages from "./Pages";

import reportWebVitals from "./reportWebVitals";

const id = "sabc-root";

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route exact path="/" element={<Pages />}></Route>
      </Route>
    </Routes>
  </BrowserRouter>,
  document.getElementById(id)
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
