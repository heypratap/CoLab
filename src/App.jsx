import { checkServerHealth } from "./services/api";
import { socket } from "./services/socket";
import { useState, useEffect } from "react";
import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import Header from "./components/Header";
import ProjectDashboard from "./components/ProjectDashboard";
import SocketTest from "./components/SocketTest";

const App = () => {

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("Connected to CoLab:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from CoLab");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    checkServerHealth()
      .then((data) => {
        console.log("Backend connected:", data);
      })
      .catch((error) => {
        console.error("Backend connection failed:", error);
      });
  }, []);

  const [projects, setProjects] = useState(() => {
    try {
      const savedProjects = localStorage.getItem("colab-projects");

      if (savedProjects !== null) {
        const parsedProjects = JSON.parse(savedProjects);

        if (Array.isArray(parsedProjects)) {
          return parsedProjects;
        }
      }

      const savedFiles = localStorage.getItem("colab-files");

      return [
        {
          id: "project-default",
          name: "My Project",
          files: savedFiles ? JSON.parse(savedFiles) : [],
          createdAt: new Date().toISOString(),
        },
      ];
    } catch (error) {
      console.error("Failed to load projects:", error);

      return [
        {
          id: "project-default",
          name: "My Project",
          files: [],
          createdAt: new Date().toISOString(),
        },
      ];
    }
  });

  const [activeProjectId, setActiveProjectId] = useState(() => {
    return (
      localStorage.getItem("colab-active-project") ||
      "project-default"
    );
  });

  const [isDashboardOpen, setIsDashboardOpen] = useState(true);

  const activeProject =
    projects.find((project) => project.id === activeProjectId) ||
    projects[0] ||
    null;

  const files = activeProject?.files || [];

  function setFiles(updater) {
    setProjects((previous) =>
      previous.map((project) => {
        if (project.id !== activeProject?.id) {
          return project;
        }

        return {
          ...project,
          files:
            typeof updater === "function"
              ? updater(project.files)
              : updater,
        };
      })
    );
  }

  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const savedWorkspaces = localStorage.getItem("colab-workspaces");

      if (savedWorkspaces) {
        return JSON.parse(savedWorkspaces);
      }

      const oldTabs =
        JSON.parse(localStorage.getItem("colab-open-tabs")) || [];

      const oldActiveFile =
        localStorage.getItem("colab-active-file") || null;

      return {
        [activeProjectId]: {
          openTabs: oldTabs,
          activeFileId: oldActiveFile,
        },
      };
    } catch {
      return {};
    }
  });

  const currentWorkspace = workspaces[activeProject?.id] || {
    openTabs: [],
    activeFileId: null,
  };

  const openTabs = currentWorkspace.openTabs;
  const activeFileId = currentWorkspace.activeFileId;

  const [saveStatus, setSaveStatus] = useState("Saved");
  const [output, setOutput] = useState("");
  const [executionStatus, setExecutionStatus] = useState("idle");

  function updateWorkspace(updates) {
    if (!activeProject) return;

    setWorkspaces((previous) => ({
      ...previous,
      [activeProject.id]: {
        openTabs: previous[activeProject.id]?.openTabs || [],
        activeFileId:
          previous[activeProject.id]?.activeFileId || null,
        ...updates,
      },
    }));
  }

  function findFileById(items, id) {
    if (!id) return null;

    for (const item of items) {
      if (item.id === id) return item;

      if (item.type === "folder") {
        const found = findFileById(item.children || [], id);

        if (found) return found;
      }
    }

    return null;
  }

  const activeFile = findFileById(files, activeFileId);

  useEffect(() => {
    setSaveStatus("Saving");

    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(
          "colab-projects",
          JSON.stringify(projects)
        );

        if (activeProject) {
          localStorage.setItem(
            "colab-active-project",
            activeProject.id
          );
        } else {
          localStorage.removeItem("colab-active-project");
        }

        localStorage.removeItem("colab-files");

        setSaveStatus("Saved");
      } catch (error) {
        console.error("Failed to save projects:", error);
        setSaveStatus("Save failed");
      }
    }, 700);

    return () => clearTimeout(saveTimer);
  }, [projects, activeProject]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "colab-workspaces",
        JSON.stringify(workspaces)
      );

      localStorage.removeItem("colab-open-tabs");
      localStorage.removeItem("colab-active-file");
    } catch (error) {
      console.error("Failed to save workspaces:", error);
    }
  }, [workspaces]);

  function updateFileContent(fileId, content) {
    function updateTree(items) {
      return items.map((item) => {
        if (item.id === fileId) {
          return { ...item, content };
        }

        if (item.type === "folder") {
          return {
            ...item,
            children: updateTree(item.children || []),
          };
        }

        return item;
      });
    }

    setFiles((previous) => updateTree(previous));
  }

  function handleFileSelect(file) {
    if (!file) {
      updateWorkspace({ activeFileId: null });
      return;
    }

    updateWorkspace({
      openTabs: openTabs.includes(file.id)
        ? openTabs
        : [...openTabs, file.id],
      activeFileId: file.id,
    });
  }

  function handleTabSelect(fileId) {
    updateWorkspace({ activeFileId: fileId });
  }

  function handleCloseTab(fileId) {
    const remainingTabs = openTabs.filter(
      (id) => id !== fileId
    );

    updateWorkspace({
      openTabs: remainingTabs,
      activeFileId:
        activeFileId === fileId
          ? remainingTabs.length > 0
            ? remainingTabs[remainingTabs.length - 1]
            : null
          : activeFileId,
    });
  }

  useEffect(() => {
    const validTabs = openTabs.filter((id) =>
      findFileById(files, id)
    );

    const activeFileExists =
      !activeFileId || findFileById(files, activeFileId);

    if (
      validTabs.length !== openTabs.length ||
      !activeFileExists
    ) {
      updateWorkspace({
        openTabs: validTabs,
        activeFileId: activeFileExists
          ? activeFileId
          : validTabs.length > 0
            ? validTabs[validTabs.length - 1]
            : null,
      });
    }
  }, [files, openTabs, activeFileId]);

  function handleOpenProject(projectId) {
    const selectedProject = projects.find(
      (project) => project.id === projectId
    );

    if (!selectedProject) {
      console.error("Project not found:", projectId);
      return;
    }

    setActiveProjectId(selectedProject.id);
    setIsDashboardOpen(false);
  }

  function handleCreateProject(name) {
    const newProject = {
      id: crypto.randomUUID(),
      name,
      files: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects((previous) => [...previous, newProject]);

    setActiveProjectId(newProject.id);
    setIsDashboardOpen(false);
  }

  function handleRenameProject(newName) {
    setProjects((previous) =>
      previous.map((project) =>
        project.id === activeProject?.id
          ? {
            ...project,
            name: newName,
            updatedAt: new Date().toISOString(),
          }
          : project
      )
    );
  }

  function handleDeleteProject(projectId) {
    const remainingProjects = projects.filter(
      (project) => project.id !== projectId
    );

    setProjects(remainingProjects);

    setWorkspaces((previous) => {
      const updatedWorkspaces = { ...previous };
      delete updatedWorkspaces[projectId];
      return updatedWorkspaces;
    });

    if (activeProjectId === projectId) {
      const nextProject = remainingProjects[0] || null;
      setActiveProjectId(nextProject?.id || null);
    }
  }


  function handleRun(file) {
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
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval';"
        />
      </head>
      <body>
        <script>
          window.addEventListener("message", (event) => {
            if (event.data.type !== "RUN_CODE") return;

            const logs = [];

            function format(value) {
              if (typeof value === "string") return value;

              try {
                const result = JSON.stringify(value);
                return result === undefined ? String(value) : result;
              } catch {
                return String(value);
              }
            }

            const customConsole = {
              log: (...args) => logs.push(args.map(format).join(" ")),
              info: (...args) => logs.push(args.map(format).join(" ")),
              warn: (...args) => logs.push("[Warning] " + args.map(format).join(" ")),
              error: (...args) => logs.push("[Error] " + args.map(format).join(" "))
            };

            try {
              const execute = new Function("console", event.data.code);
              execute(customConsole);

              parent.postMessage({
                type: "CODE_RESULT",
                status: "success",
                output: logs.join("\\n") || "Code executed successfully. No output."
              }, "*");
            } catch (error) {
              parent.postMessage({
                type: "CODE_RESULT",
                status: "error",
                output: logs.concat(error.name + ": " + error.message).join("\\n")
              }, "*");
            }
          });
        <\/script>
      </body>
    </html>
  `;


    const timeout = setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      iframe.remove();

      setOutput("Execution timed out.");
      setExecutionStatus("error");
    }, 3000);

    function handleMessage(event) {
      if (event.source !== iframe.contentWindow) return;
      if (event.data?.type !== "CODE_RESULT") return;

      clearTimeout(timeout);
      window.removeEventListener("message", handleMessage);
      iframe.remove();

      setOutput(event.data.output);
      setExecutionStatus(event.data.status);
    }

    window.addEventListener("message", handleMessage);

    iframe.onload = () => {
      iframe.contentWindow.postMessage(
        {
          type: "RUN_CODE",
          code: file.content ?? "",
        },
        "*"
      );
    };

    document.body.appendChild(iframe);
  }

  function handleClearOutput() {
    setOutput("");
    setExecutionStatus("idle");
  }

  if (isDashboardOpen) {
    return (
      <ProjectDashboard
        projects={projects}
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
        onDeleteProject={handleDeleteProject}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white p-3 flex flex-col gap-3 font-sans antialiased">
      <Header
        onGoToDashboard={() => setIsDashboardOpen(true)}
      />

      <div className="flex-1 grid grid-cols-[48px_240px_minmax(0,1fr)] gap-3 min-h-0">
        <ActivitySidebar />

        <FileExplorer
          files={files}
          setFiles={setFiles}
          activeFile={activeFile}
          onFileSelect={handleFileSelect}
          projectName={activeProject?.name || "My Project"}
          onRenameProject={handleRenameProject}
        />

        <div className="flex flex-col gap-3 min-h-0 min-w-0">
          <EditorWorkspace
            activeFile={activeFile}
            openTabs={openTabs}
            files={files}
            onFileSelect={handleTabSelect}
            onCloseTab={handleCloseTab}
            onContentChange={updateFileContent}
            onRun={handleRun}
          />

          <BottomPanel
            output={output}
            executionStatus={executionStatus}
            onClear={handleClearOutput}
          />
        </div>
      </div>

      <StatusBar saveStatus={saveStatus} />
    </div>
  );
};

export default App;
