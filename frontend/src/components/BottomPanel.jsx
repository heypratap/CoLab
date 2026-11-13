import { Terminal, Trash2, CircleCheck, CircleAlert, LoaderCircle } from "lucide-react";

function BottomPanel({ output = "", executionStatus = "idle", onClear }) {
  return (
    <section className="bg-[#111] border border-neutral-800 rounded-xl h-48 min-h-40 flex flex-col overflow-hidden shrink-0">
      {}
      <div className="h-10 flex items-center justify-between border-b border-neutral-800 px-4 shrink-0">
        <span className="text-xs font-medium text-white">Output</span>

        <div className="flex items-center gap-3">
          {executionStatus === "running" && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <LoaderCircle size={13} className="animate-spin" /> Running
            </span>
          )}
          {executionStatus === "success" && (
            <span className="flex items-center gap-1.5 text-xs text-gray-300">
              <CircleCheck size={13} /> Done
            </span>
          )}
          {executionStatus === "error" && (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <CircleAlert size={13} /> Error
            </span>
          )}
          <button
            onClick={onClear}
            disabled={!output}
            title="Clear output"
            className="text-gray-600 hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 overflow-auto p-4 font-mono text-xs">
        {output ? (
          <pre className="whitespace-pre-wrap text-gray-300">{output}</pre>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2">
            <Terminal size={18} />
            <p>Output will appear here</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default BottomPanel;
