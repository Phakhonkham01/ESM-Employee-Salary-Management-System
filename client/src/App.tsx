import { useState } from "react";

import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    // min-h-screen makes the background cover the whole page
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
      {/* Logo Container */}
      <div className="flex gap-8 mb-8">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img
            src={viteLogo}
            className="h-24 w-24 hover:drop-shadow-[0_0_2em_#646cffaa] transition-all"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img
            className="h-24 w-24 hover:drop-shadow-[0_0_2em_#61dafbaa] animate-[spin_20s_linear_infinite]"
            alt="React logo"
          />
        </a>
      </div>

      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        Vite + React
      </h1>

      <div className="bg-slate-800 p-10 rounded-2xl shadow-xl border border-slate-700 text-center">
        <button
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all px-6 py-3 rounded-lg font-medium text-lg mb-4"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>

        <p className="text-slate-400">
          Edit <code className="text-pink-400 font-mono">src/App.tsx</code> and
          save to test HMR
        </p>
      </div>

      <p className="mt-8 text-slate-500 italic">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
