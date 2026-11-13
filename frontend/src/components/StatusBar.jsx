import { Check, LoaderCircle, AlertCircle } from "lucide-react";

function StatusBar({ saveStatus, activeFile }) {
  return (
    <footer className="bg-[#111] border border-neutral-800 rounded-xl h-8 flex items-center justify-between px-4 text-xs text-gray-500 shrink-0">
      <span>colab</span>

      <div className="flex items-center gap-4">
        {activeFile && (
          <span className="text-gray-600">{activeFile.name}</span>
        )}

        <div className="flex items-center gap-1.5">
          {saveStatus === "Saving" && (
            <>
              <LoaderCircle size={12} className="animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === "Saved" && (
            <>
              <Check size={12} />
              <span>Saved</span>
            </>
          )}
          {saveStatus === "Save failed" && (
            <>
              <AlertCircle size={12} />
              <span>Save failed</span>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}

export default StatusBar;
