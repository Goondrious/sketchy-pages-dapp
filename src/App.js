/* global chrome */
import React from "react";
import { Outlet } from "react-router-dom";

import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";

import banner from "./banner.png";

function App() {
  return (
    <Box>
      <CssBaseline />
      <Box sx={{ width: "100%", height: "300px", position: "static" }}>
        <img
          src={banner}
          style={{ objectFit: "cover", width: "100%", height: "100%" }}
        />
      </Box>
      <Box
        sx={{
          padding: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default App;
