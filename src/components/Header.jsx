import { LayoutDashboard, Code2 } from "lucide-react";

function Header({ onGoToDashboard }) {
  return (
    <header className="bg-[#1e1e1e] border border-neutral-800 rounded-xl h-14 flex items-center justify-between px-4 text-sm font-medium">
      <div className="flex items-center gap-3">
        <Code2 size={18} className="text-gray-400" />

        <span className="text-gray-300">
          CoLab
        </span>
      </div>

      <button
        onClick={onGoToDashboard}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition"
      >
        <LayoutDashboard size={16} />
        <span>Dashboard</span>
      </button>
    </header>
  );
}

export default Header;
