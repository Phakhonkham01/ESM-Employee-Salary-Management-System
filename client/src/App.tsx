import { useState } from "react";

import viteLogo from "/vite.svg";
import Attendance from "./Attendance/Attendance";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Attendance/>
    </>
  );
}

export default App;
