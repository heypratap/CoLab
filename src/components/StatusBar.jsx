
import { Check, Cloud, LoaderCircle, AlertCircle } from "lucide-react";

function StatusBar({ saveStatus }) {
  return (
    <footer className="bg-[#AAFF00] text-black rounded-xl h-10 flex items-center justify-between px-4 text-xs font-medium shadow-md">

      <span>CoLab</span>

      <div className="flex items-center gap-2">
        {saveStatus === "Saving" && (
          <>
            <LoaderCircle size={14} className="animate-spin" />
            <span>Saving...</span>
          </>
        )}

        {saveStatus === "Saved" && (
          <>
            <Check size={14} />
            <span>Saved</span>
          </>
        )}

        {saveStatus === "Save failed" && (
          <>
            <AlertCircle size={14} />
            <span>Save failed</span>
          </>
        )}
      </div>

    </footer>
  );
}

export default StatusBar;
