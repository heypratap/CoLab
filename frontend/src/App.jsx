import { checkServerHealth } from "./services/api";
import { socket } from "./services/socket";
import { useState, useEffect, useRef } from "react";
import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import Header from "./components/Header";
import ProjectDashboard from "./components/ProjectDashboard";

function UsernameModal({ onSubmit }) {
  const [nameInput, setNameInput] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (cleanName) {
      onSubmit(cleanName);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-sm border border-neutral-800 bg-[#111] rounded-xl p-8">
        <h1 className="text-white text-xl font-semibold mb-1">Welcome to CoLab</h1>
        <p className="text-gray-500 text-sm mb-6">What should we call you?</p>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            maxLength={24}
            className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white text-sm outline-none placeholder:text-gray-600 focus:border-gray-400"
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="mt-4 w-full rounded-lg bg-white text-black text-sm font-medium py-2.5 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {

  const [username, setUsername] = useState(() => {
    return localStorage.getItem("colab-username") || "";
  });

  function saveUsername(name) {
    localStorage.setItem("colab-username", name);
    setUsername(name);
  }

  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("users-update", (users) => {
      setOnlineUsers(users);
    });

    socket.on("disconnect", () => {
      setOnlineUsers([]);
      console.log("Disconnected from server");
    });

    return () => {
      socket.off("connect");
      socket.off("users-update");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    checkServerHealth()
      .then((data) => console.log("Backend status:", data))
      .catch((err) => console.log("Backend offline:", err));
  }, []);

  const inviteProjectId = (() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("project")?.trim() || params.get("invite")?.trim() || null;
    } catch {
      return null;
    }
  })();

  const [projects, setProjects] = useState(() => {
    let saved = [];
    try {
      const stored = localStorage.getItem("colab-projects");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) saved = parsed;
      }
    } catch {

    }

    if (saved.length === 0) {
      saved = [
        {
          id: "project-default",
          name: "My Project",
          files: [],
          createdAt: new Date().toISOString(),
        },
      ];
    }

    if (inviteProjectId && !saved.some((p) => p.id === inviteProjectId)) {
      saved.unshift({
        id: inviteProjectId,
        name: "Shared Project",
        files: [],
        createdAt: new Date().toISOString(),
      });
    }

    return saved;
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    if (inviteProjectId) return inviteProjectId;
    return localStorage.getItem("colab-active-project") || "project-default";
  });

  const [isDashboardOpen, setIsDashboardOpen] = useState(() => {
    if (inviteProjectId) return false;
    return true;
  });

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  const files = activeProject?.files || [];

  function findFile(items, id) {
    if (!id) return null;
    for (const item of items) {
      if (item.id === id) return item;
      if (item.type === "folder" && item.children) {
        const found = findFile(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  function updateFiles(updater) {
    setSaveStatus("Saving");
    setProjects((prev) => {
      return prev.map((project) => {
        if (project.id !== activeProject?.id) return project;
        const newFiles =
          typeof updater === "function" ? updater(project.files) : updater;

        socket.emit("update-project-files", {
          projectId: project.id,
          files: newFiles,
        });

        return {
          ...project,
          files: newFiles,
        };
      });
    });
  }

  useEffect(() => {
    if (!activeProject || !username) return;

    socket.emit("join-project", {
      projectId: activeProject.id,
      username,
      projectData: activeProject,
    });

  }, [activeProject?.id, username]);

  useEffect(() => {
    function onSyncProject(remoteProject) {
      if (!remoteProject) return;
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === remoteProject.id);
        if (exists) {
          return prev.map((p) => {
            if (p.id !== remoteProject.id) return p;
            const updatedFiles =
              remoteProject.files && remoteProject.files.length > 0
                ? remoteProject.files
                : p.files;
            return { ...p, ...remoteProject, files: updatedFiles };
          });
        }
        return [remoteProject, ...prev];
      });
      setActiveProjectId(remoteProject.id);
      setIsDashboardOpen(false);
    }

    function onProjectFilesUpdated({ projectId, files: newFiles }) {
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, files: newFiles } : p))
      );
    }

    function onRequestProjectState({ projectId }) {
      setProjects((currentList) => {
        const found = currentList.find((p) => p.id === projectId);
        if (found && found.files && found.files.length > 0) {
          socket.emit("provide-project-state", {
            projectId,
            projectData: found,
          });
        }
        return currentList;
      });
    }

    socket.on("sync-project-data", onSyncProject);
    socket.on("project-files-updated", onProjectFilesUpdated);
    socket.on("request-project-state", onRequestProjectState);

    return () => {
      socket.off("sync-project-data", onSyncProject);
      socket.off("project-files-updated", onProjectFilesUpdated);
      socket.off("request-project-state", onRequestProjectState);
    };
  }, [activeProject]);

  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const stored = localStorage.getItem("colab-workspaces");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const currentWorkspace = workspaces[activeProject?.id] || {
    openTabs: [],
    activeFileId: null,
  };

  const rawTabs = currentWorkspace.openTabs || [];
  const openTabs = rawTabs.filter((id) => findFile(files, id));
  const activeFileId = openTabs.includes(currentWorkspace.activeFileId)
    ? currentWorkspace.activeFileId
    : openTabs[openTabs.length - 1] || null;

  const [saveStatus, setSaveStatus] = useState("Saved");
  const [output, setOutput] = useState("");
  const [executionStatus, setExecutionStatus] = useState("idle");

  function updateWorkspaceState(updates) {
    if (!activeProject) return;
    setWorkspaces((prev) => ({
      ...prev,
      [activeProject.id]: {
        openTabs: prev[activeProject.id]?.openTabs || [],
        activeFileId: prev[activeProject.id]?.activeFileId || null,
        ...updates,
      },
    }));
  }

  const activeFile = findFile(files, activeFileId);

  const lastFileRoomRef = useRef(null);

  useEffect(() => {
    if (!username || !activeFileId) return;
    const roomId = "file-" + activeFileId;
    if (lastFileRoomRef.current !== roomId) {
      lastFileRoomRef.current = roomId;
      socket.emit("join-file-room", { roomId, username });
    }
  }, [activeFileId, username]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("colab-projects", JSON.stringify(projects));
        if (activeProject) {
          localStorage.setItem("colab-active-project", activeProject.id);
        }
        setSaveStatus("Saved");
      } catch {
        setSaveStatus("Save failed");
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [projects, activeProject]);

  useEffect(() => {
    try {
      localStorage.setItem("colab-workspaces", JSON.stringify(workspaces));
    } catch {

    }
  }, [workspaces]);

  function handleSelectFile(file) {
    if (!file) {
      updateWorkspaceState({ activeFileId: null });
      return;
    }
    updateWorkspaceState({
      openTabs: openTabs.includes(file.id) ? openTabs : [...openTabs, file.id],
      activeFileId: file.id,
    });
  }

  function handleSelectTab(fileId) {
    updateWorkspaceState({ activeFileId: fileId });
  }

  function handleCloseTab(fileId) {
    const remaining = openTabs.filter((id) => id !== fileId);
    updateWorkspaceState({
      openTabs: remaining,
      activeFileId:
        activeFileId === fileId
          ? remaining.length > 0
            ? remaining[remaining.length - 1]
            : null
          : activeFileId,
    });
  }

  function handleOpenProject(projectId) {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    setActiveProjectId(project.id);
    setIsDashboardOpen(false);
    const newUrl = window.location.pathname + "?project=" + project.id;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  function handleCreateProject(name) {
    const newProject = {
      id: crypto.randomUUID(),
      name: name,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newProject.id);
    setIsDashboardOpen(false);
    const newUrl = window.location.pathname + "?project=" + newProject.id;
    window.history.pushState({ path: newUrl }, "", newUrl);
  }

  function handleJoinProject(linkOrId) {
    if (!linkOrId?.trim()) return;
    let targetId = linkOrId.trim();
    try {
      if (targetId.includes("project=")) {
        const parsedUrl = new URL(targetId);
        targetId = parsedUrl.searchParams.get("project") || targetId;
      }
    } catch {

    }

    setProjects((prev) => {
      if (prev.some((p) => p.id === targetId)) return prev;
      return [
        {
          id: targetId,
          name: "Shared Project",
          files: [],
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });

    setActiveProjectId(targetId);
    setIsDashboardOpen(false);

    const newUrl = window.location.pathname + "?project=" + targetId;
    window.history.pushState({ path: newUrl }, "", newUrl);

    if (username) {
      socket.emit("join-project", {
        projectId: targetId,
        username: username,
      });
    }
  }

  function handleRenameProject(newName) {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProject?.id
          ? { ...p, name: newName, updatedAt: new Date().toISOString() }
          : p
      )
    );
  }

  function handleDeleteProject(projectId) {
    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    setWorkspaces((prev) => {
      const copy = { ...prev };
      delete copy[projectId];
      return copy;
    });
    if (activeProjectId === projectId) {
      setActiveProjectId(remaining[0]?.id || null);
    }
  }

  function handleRunCode(file) {
    if (!file) return;
    setOutput("");
    setExecutionStatus("running");

    const iframe = document.createElement("iframe");
    iframe.setAttribute("sandbox", "allow-scripts");
    iframe.style.display = "none";

    iframe.srcdoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval';" />
      </head>
      <body>
        <script>
          window.addEventListener("message", (e) => {
            if (e.data.type !== "RUN_CODE") return;
            const outputList = [];
            const safeConsole = {
              log: (...args) => outputList.push(args.join(" ")),
              info: (...args) => outputList.push(args.join(" ")),
              warn: (...args) => outputList.push("[Warning] " + args.join(" ")),
              error: (...args) => outputList.push("[Error] " + args.join(" ")),
            };
            try {
              const runFn = new Function("console", e.data.code);
              runFn(safeConsole);
              parent.postMessage({ type: "CODE_RESULT", status: "success", output: outputList.join("\\n") || "Done. No output." }, "*");
            } catch (err) {
              parent.postMessage({ type: "CODE_RESULT", status: "error", output: outputList.concat(err.name + ": " + err.message).join("\\n") }, "*");
            }
          });
        </script>
      </body>
    </html>`;

    const timer = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      iframe.remove();
      setOutput("Code execution timed out.");
      setExecutionStatus("error");
    }, 3000);

    function onMessage(e) {
      if (e.source !== iframe.contentWindow) return;
      if (e.data?.type !== "CODE_RESULT") return;
      clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      iframe.remove();
      setOutput(e.data.output);
      setExecutionStatus(e.data.status);
    }

    window.addEventListener("message", onMessage);
    iframe.onload = () => {
      iframe.contentWindow.postMessage(
        { type: "RUN_CODE", code: file.content || "" },
        "*"
      );
    };
    document.body.appendChild(iframe);
  }

  function handleClearOutput() {
    setOutput("");
    setExecutionStatus("idle");
  }

  if (!username) {
    return <UsernameModal onSubmit={saveUsername} />;
  }

  if (isDashboardOpen) {
    return (
      <ProjectDashboard
        projects={projects}
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
        onJoinProject={handleJoinProject}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white p-3 flex flex-col gap-3 font-sans antialiased">
      <Header
        onGoToDashboard={() => setIsDashboardOpen(true)}
        onlineUsers={onlineUsers}
        username={username}
        activeProject={activeProject}
      />

      <div className="flex-1 grid grid-cols-[48px_240px_minmax(0,1fr)] gap-3 min-h-0">
        <ActivitySidebar />

        <FileExplorer
          files={files}
          setFiles={updateFiles}
          activeFile={activeFile}
          onFileSelect={handleSelectFile}
          projectName={activeProject?.name || "My Project"}
          onRenameProject={handleRenameProject}
        />

        <div className="flex flex-col gap-3 min-h-0 min-w-0">
          <EditorWorkspace
            activeFile={activeFile}
            openTabs={openTabs}
            files={files}
            onFileSelect={handleSelectTab}
            onCloseTab={handleCloseTab}
            onContentChange={(fileId, newContent) => {
              updateFiles((prev) =>
                prev.map((item) => {
                  if (item.id === fileId) return { ...item, content: newContent };
                  if (item.type === "folder" && item.children) {
                    function updateFolder(list) {
                      return list.map((child) =>
                        child.id === fileId
                          ? { ...child, content: newContent }
                          : child.type === "folder" && child.children
                          ? { ...child, children: updateFolder(child.children) }
                          : child
                      );
                    }
                    return { ...item, children: updateFolder(item.children) };
                  }
                  return item;
                })
              );
            }}
            onRun={handleRunCode}
            username={username}
          />

          <BottomPanel
            output={output}
            executionStatus={executionStatus}
            onClear={handleClearOutput}
          />
        </div>
      </div>

      <StatusBar saveStatus={saveStatus} activeFile={activeFile} />
    </div>
  );
}

export default App;
