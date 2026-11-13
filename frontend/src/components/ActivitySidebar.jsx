import { Files, Users, Settings } from "lucide-react";
import { useState } from "react";

function ActivitySidebar() {
  const [active, setActive] = useState("explorer");

  const icons = [
    { id: "explorer", label: "Explorer", icon: Files },
    { id: "users", label: "Collaborators", icon: Users },
  ];

  return (
    <aside className="bg-[#111] border border-neutral-800 rounded-xl w-12 shrink-0 flex flex-col items-center justify-between py-4 text-gray-500">
      <div className="flex flex-col gap-3 w-full px-2">
        {icons.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-label={label}
            title={label}
            onClick={() => setActive(id)}
            className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
              active === id
                ? "text-white bg-neutral-800"
                : "hover:text-gray-300 hover:bg-neutral-800/50"
            }`}
          >
            <Icon size={20} strokeWidth={1.8} />
          </button>
        ))}
      </div>

      <div className="px-2 w-full">
        <button
          aria-label="Settings"
          title="Settings"
          onClick={() => setActive("settings")}
          className={`w-full flex items-center justify-center p-2 rounded-lg transition-colors ${
            active === "settings"
              ? "text-white bg-neutral-800"
              : "hover:text-gray-300 hover:bg-neutral-800/50"
          }`}
        >
          <Settings size={20} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}

export default ActivitySidebar;
