
import { useState } from "react";
import {
  Terminal,
  Trash2,
  CircleCheck,
  CircleAlert,
  LoaderCircle,
} from "lucide-react";

function BottomPanel({
  output = "",
  executionStatus = "idle",
  onClear,
}) {
  const [activeTab, setActiveTab] = useState("output");

  return (
    <section className="bg-[#1e1e1e] border border-neutral-800 rounded-xl h-48 min-h-40 flex flex-col overflow-hidden">
      <div className="h-10 flex items-center justify-between border-b border-neutral-800 px-4 shrink-0">
        <div className="flex items-center gap-5 h-full">
          <button
            onClick={() => setActiveTab("output")}
            className={`h-full text-xs font-medium border-b-2 transition ${
              activeTab === "output"
                ? "text-white border-white"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            Output
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`h-full text-xs font-medium border-b-2 transition ${
              activeTab === "terminal"
                ? "text-white border-white"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            Terminal
          </button>
        </div>

        <div className="flex items-center gap-3">
          {executionStatus === "running" && (
            <span className="flex items-center gap-2 text-xs text-yellow-400">
              <LoaderCircle size={13} className="animate-spin" />
              Running
            </span>
          )}

          {executionStatus === "success" && (
            <span className="flex items-center gap-2 text-xs text-green-400">
              <CircleCheck size={13} />
              Finished
            </span>
          )}

          {executionStatus === "error" && (
            <span className="flex items-center gap-2 text-xs text-red-400">
              <CircleAlert size={13} />
              Error
            </span>
          )}

          <button
            onClick={onClear}
            disabled={!output || !onClear}
            title="Clear output"
            className="text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {activeTab === "output" ? (
          output ? (
            <pre className="whitespace-pre-wrap text-gray-300">
              {output}
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
              <Terminal size={20} />
              <p>Program output will appear here</p>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
            <Terminal size={20} />
            <p>Terminal is not connected yet</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BottomPanel;
