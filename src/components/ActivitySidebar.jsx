import { Files, Search, GitBranch, Blocks, Settings } from 'lucide-react';

import { useState } from 'react';
function ActivitySidebar() {

  const [active, setActive] = useState("explorer");

  const icons = [
    { id: 'explorer', label: 'Explorer', icon: Files },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'git', label: 'Source Control', icon: GitBranch },
    { id: 'blocks', label: 'Blocks', icon: Blocks },
  ];

  return (
    <aside className="bg-[#1e1e1e] border border-neutral-800 rounded-xl w-12 shrink-0 flex flex-col items-center justify-between py-4 text-gray-400">
      <div className="flex flex-col gap-4 w-full px-2">
        {icons.map((icon) => {
          const VisibleIcons = icon.icon;
          const isActive = active === icon.id;
          return (
            <button aria-label={icon.label} aria-pressed={isActive}
              key={icon.id} onClick={() => setActive(icon.id)} title={icon.label}
              className={`relative w-full flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer
              ${isActive ? 'text-[#AAFF00] bg-neutral-800' : 'hover:text-gray-200 hover:bg-neutral-800/40'}`}
            ><VisibleIcons size={21} strokeWidth={1.8} />
            </button>
          );
        })}
      </div>
      <div className="px-2 w-full flex justify-center">
        <button
          aria-label="Settings"
          aria-pressed={active === 'settings'}
          title="Settings"
          onClick={() => setActive('settings')}
          className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer ${active === 'settings' ? 'text-[#AAFF00] bg-neutral-800' : 'hover:text-gray-200 hover:bg-neutral-800/40'}`}
        >
          <Settings size={21} strokeWidth={1.8} />
        </button>

      </div>
    </aside>
  );
}

export default ActivitySidebar