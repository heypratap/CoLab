import { useState, useEffect } from "react";
import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import Header from "./components/Header";
import ProjectDashboard from "./components/ProjectDashboard";

const App = () => {
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

  const [openTabs, setOpenTabs] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("colab-open-tabs")) || []
      );
    } catch {
      return [];
    }
  });

  const [activeFileId, setActiveFileId] = useState(() => {
    return localStorage.getItem("colab-active-file") || null;
  });

  const [saveStatus, setSaveStatus] = useState("Saved");

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
    localStorage.setItem(
      "colab-open-tabs",
      JSON.stringify(openTabs)
    );
  }, [openTabs]);
  useEffect(() => {
    if (activeFileId) {
      localStorage.setItem("colab-active-file", activeFileId);
    } else {
      localStorage.removeItem("colab-active-file");
    }
  }, [activeFileId]);

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
      setActiveFileId(null);
      return;
    }

    setOpenTabs((previous) =>
      previous.includes(file.id)
        ? previous
        : [...previous, file.id]
    );

    setActiveFileId(file.id);
  }

  function handleTabSelect(fileId) {
    setActiveFileId(fileId);
  }

  function handleCloseTab(fileId) {
    const remainingTabs = openTabs.filter(
      (id) => id !== fileId
    );

    setOpenTabs(remainingTabs);

    if (activeFileId === fileId) {
      setActiveFileId(
        remainingTabs.length > 0
          ? remainingTabs[remainingTabs.length - 1]
          : null
      );
    }
  }

  useEffect(() => {
    const validTabs = openTabs.filter((id) =>
      findFileById(files, id)
    );

    if (validTabs.length !== openTabs.length) {
      setOpenTabs(validTabs);
    }

    if (activeFileId && !findFileById(files, activeFileId)) {
      setActiveFileId(
        validTabs.length > 0
          ? validTabs[validTabs.length - 1]
          : null
      );
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
    setOpenTabs([]);
    setActiveFileId(null);
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
    setOpenTabs([]);
    setActiveFileId(null);
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

    // If the active project is deleted, select another project
    if (activeProjectId === projectId) {
      const nextProject = remainingProjects[0] || null;

      setActiveProjectId(nextProject?.id || null);

      setOpenTabs([]);
      setActiveFileId(null);
    }
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
      <Header />

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
          />

          <BottomPanel />
        </div>
      </div>

      <StatusBar saveStatus={saveStatus} />
    </div>
  );
};

export default App;
