import { useState } from "react";
import { Code2, UserPlus, Check, Copy, X, LayoutDashboard } from "lucide-react";

function Header({
  onGoToDashboard,
  onlineUsers = [],
  username,
  activeProject,
}) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  const inviteLink = activeProject?.id
    ? window.location.origin + "/?invite=" + activeProject.id
    : "";

  function copyInviteLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setHasCopiedLink(true);
      setTimeout(() => setHasCopiedLink(false), 2000);
    }).catch(() => {
      prompt("Copy invite link:", inviteLink);
    });
  }

  function copyProjectCode() {
    if (!activeProject?.id) return;
    navigator.clipboard.writeText(activeProject.id).then(() => {
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2000);
    }).catch(() => {
      prompt("Copy project code:", activeProject.id);
    });
  }

  return (
    <>
      <header className="bg-[#111] border border-neutral-800 rounded-xl h-14 flex items-center justify-between px-4 text-sm font-medium shrink-0">
        { }
        <div
          onClick={onGoToDashboard}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition"
          title="Go to Dashboard"
        >
          <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center">
            <Code2 size={15} className="text-black" />
          </div>
          <span className="text-white font-semibold tracking-tight">CoLab</span>
          {activeProject?.name && (
            <span className="text-xs text-gray-500 font-normal border-l border-neutral-800 pl-3">
              {activeProject.name}
            </span>
          )}
        </div>

        { }
        {onlineUsers.length > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {onlineUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  title={user.username}
                  style={{ backgroundColor: user.color || "#38bdf8" }}
                  className="h-7 w-7 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold text-black select-none shadow-sm"
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-xs text-gray-300">
              {onlineUsers.length === 1
                ? `${onlineUsers[0]?.username} (you)`
                : onlineUsers.map((u) => u.username).join(", ")}
            </span>
          </div>
        )}

        { }
        <div className="flex items-center gap-2.5">
          {activeProject && (
            <button
              onClick={() => setShowInviteModal(true)}
              title="Invite collaborators to this project"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 text-gray-300 hover:text-white hover:bg-neutral-800 transition text-xs font-medium"
            >
              <UserPlus size={14} />
              <span>Invite</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400 px-2 py-1">
            <div className="h-6 w-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-medium">
              {username?.charAt(0).toUpperCase()}
            </div>
            <span>{username}</span>
          </div>

          <button
            onClick={onGoToDashboard}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-neutral-800 transition text-xs"
          >
            <LayoutDashboard size={15} />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      { }
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md border border-neutral-800 bg-[#111] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-base font-semibold">Invite Collaborators</h2>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-500 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-gray-400 text-xs mb-5">
              Anyone with this link or project ID can join and edit your files in real time.
            </p>

            <div className="space-y-4">
              { }
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Invite Link</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={inviteLink}
                    className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-gray-300 font-mono outline-none select-all"
                  />
                  <button
                    onClick={copyInviteLink}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white text-black text-xs font-medium rounded-lg hover:bg-gray-200 transition shrink-0"
                  >
                    {hasCopiedLink ? <Check size={13} /> : <Copy size={13} />}
                    <span>{hasCopiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              { }
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Project ID Code</label>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={activeProject?.id || ""}
                    className="flex-1 bg-black border border-neutral-800 rounded-lg px-3 py-2 text-xs text-gray-400 font-mono outline-none select-all"
                  />
                  <button
                    onClick={copyProjectCode}
                    className="flex items-center gap-1.5 px-3 py-2 border border-neutral-700 text-gray-300 text-xs font-medium rounded-lg hover:text-white hover:bg-neutral-800 transition shrink-0"
                  >
                    {hasCopiedCode ? <Check size={13} /> : <Copy size={13} />}
                    <span>{hasCopiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-800/80 flex justify-end">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 bg-neutral-800 text-white text-xs font-medium rounded-lg hover:bg-neutral-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
