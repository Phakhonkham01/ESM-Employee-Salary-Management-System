import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Create_Supervisor_and_Admin from "./Supervisor_Management/CRUD_Admin/Create_Supervisor_and_Admin.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <App /> */}
    <Create_Supervisor_and_Admin />
  </StrictMode>
);
