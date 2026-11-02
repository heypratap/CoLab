import { useState, useEffect } from "react";
import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import Header from "./components/Header";

const App = () => {
  const [files, setFiles] = useState(() => {
    try {
      const savedFiles = localStorage.getItem("colab-files");
      return savedFiles ? JSON.parse(savedFiles) : [];
    } catch (error) {
      console.error("Failed to load files:", error);
      return [];
    }
  });
  const [openTabs, setOpenTabs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("colab-open-tabs")) || [];
    } catch {
      return [];
    }
  });

  const [activeFileId, setActiveFileId] = useState(() => {
    return localStorage.getItem("colab-active-file") || null;
  });

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
    try {
      localStorage.setItem("colab-files", JSON.stringify(files));
    } catch (error) {
      console.error("Failed to save files:", error);
    }
  }, [files]);

  useEffect(() => {
    localStorage.setItem("colab-open-tabs", JSON.stringify(openTabs));
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

  // Close tab
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

      <StatusBar />
    </div>
  );
};

export default App;
