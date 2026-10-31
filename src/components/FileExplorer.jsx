
import { useState } from "react";
import {
  FilePlus,
  FolderPlus,
  Ellipsis,
  RefreshCw,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileText
} from "lucide-react";

// CoLab project structure
const initialFiles = [];

function FileExplorer() {
  const [expandedFolders, setExpandedFolders] = useState(["src"]);
  const [files, setFiles] = useState(initialFiles);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [projectName, setProjectName] = useState("My Project");
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);

  function toggleFolder(id) {
    setExpandedFolders((previous) =>
      previous.includes(id)
        ? previous.filter((folderId) => folderId !== id)
        : [...previous, id]
    );
  }

  function addItemToTree(items, parentId, newItem) {
    if (parentId === null) {
      return [...items, newItem];
    }

    return items.map((item) => {
      if (item.id === parentId && item.type === "folder") {
        return {
          ...item,
          children: [...(item.children || []), newItem],
        };
      }

      if (item.type === "folder") {
        return {
          ...item,
          children: addItemToTree(
            item.children || [],
            parentId,
            newItem
          ),
        };
      }

      return item;
    });
  }
  function createFile() {
    const fileName = prompt("Enter file name:");

    if (!fileName?.trim()) return;

    const newFile = {
      id: crypto.randomUUID(),
      name: fileName.trim(),
      type: "file",
    };

    setFiles((previousFiles) =>
      addItemToTree(previousFiles, selectedFolder, newFile)
    );
  }

  function createFolder() {
    const folderName = prompt("Enter folder name:");

    if (!folderName?.trim()) return;

    const newFolder = {
      id: crypto.randomUUID(),
      name: folderName.trim(),
      type: "folder",
      children: [],
    };

    setFiles((previousFiles) =>
      addItemToTree(previousFiles, selectedFolder, newFolder)
    );

    if (selectedFolder) {
      setExpandedFolders((previous) =>
        previous.includes(selectedFolder)
          ? previous
          : [...previous, selectedFolder]
      );
    }
  }

  function renameItem(itemId) {
    const findItem = (items) => {
      for (const item of items) {
        if (item.id === itemId) return item;

        if (item.type === "folder") {
          const found = findItem(item.children || []);
          if (found) return found;
        }
      }

      return null;
    };

    const item = findItem(files);
    if (!item) return;

    const newName = prompt("Enter new name:", item.name);

    if (!newName?.trim() || newName.trim() === item.name) return;

    function updateTree(items) {
      return items.map((current) => {
        if (current.id === itemId) {
          return { ...current, name: newName.trim() };
        }

        if (current.type === "folder") {
          return {
            ...current,
            children: updateTree(current.children || []),
          };
        }

        return current;
      });
    }

    setFiles((previousFiles) => updateTree(previousFiles));
  }


  function renderTree(items, level = 0) {
    return items.map((item) => {
      const isFolder = item.type === "folder";
      const isExpanded = expandedFolders.includes(item.id);

      const Icon = isFolder
        ? isExpanded ? FolderOpen : Folder
        : item.name.endsWith(".md") ? FileText : FileCode;

      return (
        <div key={item.id}>
          <button title="Double-click to rename"
            onClick={() => {
              if (isFolder) {
                setSelectedFolder(item.id);
                toggleFolder(item.id);
              }
            }}
            className={`w-full flex items-center gap-2 py-1 px-2 rounded text-left
              ${selectedFolder === item.id
                ? "bg-neutral-700 text-white"
                : "text-gray-400 hover:bg-neutral-800 hover:text-white"
              }`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            {isFolder ? (
              isExpanded
                ? <ChevronDown size={14} />
                : <ChevronRight size={14} />
            ) : (
              <span className="w-3.5" />
            )}

            <Icon size={16} />
            onDoubleClick={(event) => {
              event.stopPropagation();
              renameItem(item.id);
            }}
          </button>

          {isFolder && isExpanded && item.children?.length > 0 && (
            <div>
              {renderTree(item.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <aside className="bg-[#1e1e1e] border-r border-neutral-800 w-60 shrink-0 p-3 text-sm flex flex-col min-h-0 overflow-hidden">

      {/* Explorer toolbar */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-semibold tracking-wide">EXPLORER</span>

        <div className="flex items-center gap-2 text-gray-400">
          <button onClick={createFile} title="New File" className="hover:text-white">
            <FilePlus size={15} />
          </button>
          <button onClick={createFolder} title="New Folder" className="hover:text-white">
            <FolderPlus size={15} />
          </button>
          <button title="Refresh" className="hover:text-white">
            <RefreshCw size={15} />
          </button>
          <button title="More Actions" className="hover:text-white">
            <Ellipsis size={15} />
          </button>
        </div>
      </div>

      {/* Project root */}
      <div>
        <button
          onClick={() => setIsProjectExpanded((previous) => !previous)}
          className="w-full flex items-center gap-2 font-semibold mb-2 text-left hover:text-white"
        >
          {isProjectExpanded ? (
            <ChevronDown size={14} />
          ) : (
            <ChevronRight size={14} />
          )}

          {isProjectExpanded ? (
            <FolderOpen size={16} />
          ) : (
            <Folder size={16} />
          )}

          <span>{projectName}</span>
        </button>

        {isProjectExpanded && (
          <div>
            {files.length === 0 ? (
              <p className="text-xs text-gray-500 px-6 py-2">
              </p>
            ) : (
              renderTree(files)
            )}
          </div>
        )}
      </div>

    </aside>
  );
}

export default FileExplorer;
