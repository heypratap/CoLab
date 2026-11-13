import { useState } from "react";
import { ChevronDown, ChevronRight, FileCode, FileText, Folder, FolderOpen, FilePlus,
FolderPlus, Trash2 } from "lucide-react";

const FileExplorer = ({files, setFiles, activeFile, onFileSelect, projectName, onRenameProject,
}) => {
  const [projectNameInput, setProjectNameInput] = useState("");
  const [isRenamingProject, setIsRenamingProject] = useState(false);
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [creationType, setCreationType] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [renamingItemId, setRenamingItemId] = useState(null);
  const [renameInput, setRenameInput] = useState("");
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
  function startCreating(type) {
    setCreationType(type);
    setNewItemName("");
    setIsProjectExpanded(true);

    if (selectedFolder !== null) {
      setExpandedFolders((previous) =>
        previous.includes(selectedFolder)
          ? previous
          : [...previous, selectedFolder]
      );
    }
  }
  function finishCreating() {
    const name = newItemName.trim();

    if (!name || !creationType) {
      setCreationType(null);
      setNewItemName("");
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      name,
      type: creationType,
      ...(creationType === "folder" && { children: [] }),
      ...(creationType === "file" && { content: "" }),
    };

    setFiles((previous) =>
      addItemToTree(previous, selectedFolder, newItem)
    );

    setCreationType(null);
    setNewItemName("");
  }
  function handleCreationKeyDown(event) {
    if (event.key === "Enter") {
      finishCreating();
    }

    if (event.key === "Escape") {
      setCreationType(null);
      setNewItemName("");
    }
  }
  function startRenamingProject() {
    setProjectNameInput(projectName);
    setIsRenamingProject(true);
  }
  function finishRenamingProject() {
    const name = projectNameInput.trim();

    if (name && name !== projectName) {
      onRenameProject(name);
    }

    setIsRenamingProject(false);
  }
  function handleProjectRenameKeyDown(event) {
    if (event.key === "Enter") {
      finishRenamingProject();
    }

    if (event.key === "Escape") {
      setProjectNameInput(projectName);
      setIsRenamingProject(false);
    }
  }
  function startRenamingItem(item) {
    setRenamingItemId(item.id);
    setRenameInput(item.name);
  }
  function finishRenamingItem() {
    const name = renameInput.trim();
    const itemId = renamingItemId;

    if (name && itemId) {
      function updateTree(items) {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, name };
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

      if (activeFile?.id === itemId) {
        onFileSelect({ ...activeFile, name });
      }
    }

    setRenamingItemId(null);
    setRenameInput("");
  }
  function handleRenameKeyDown(event) {
    if (event.key === "Enter") {
      finishRenamingItem();
    }

    if (event.key === "Escape") {
      setRenamingItemId(null);
      setRenameInput("");
    }
  }
  function containsItem(items, targetId) {
    if (!targetId) return false;

    return items.some(
      (item) =>
        item.id === targetId ||
        (item.type === "folder" &&
          containsItem(item.children || [], targetId))
    );
  }
  function findItem(items, id) {
    for (const item of items) {
      if (item.id === id) return item;

      if (item.type === "folder") {
        const found = findItem(item.children || [], id);

        if (found) return found;
      }
    }

    return null;
  }
  function deleteItem(itemId) {
    const deletedItem = findItem(files, itemId);

    function removeFromTree(items) {
      return items
        .filter((item) => item.id !== itemId)
        .map((item) => {
          if (item.type === "folder") {
            return {
              ...item,
              children: removeFromTree(item.children || []),
            };
          }

          return item;
        });
    }

    if (
      activeFile &&
      deletedItem &&
      (deletedItem.id === activeFile.id ||
        (deletedItem.type === "folder" &&
          containsItem(
            deletedItem.children || [],
            activeFile.id
          )))
    ) {
      onFileSelect(null);
    }

    if (
      selectedFolder === itemId ||
      (deletedItem?.type === "folder" &&
        containsItem(
          deletedItem.children || [],
          selectedFolder
        ))
    ) {
      setSelectedFolder(null);
    }

    setFiles((previous) => removeFromTree(previous));

    setExpandedFolders((previous) =>
      previous.filter((id) => id !== itemId)
    );

    if (renamingItemId === itemId) {
      setRenamingItemId(null);
      setRenameInput("");
    }
  }

  function renderCreationInput(parentId, level) {
    if (
      creationType === null ||
      selectedFolder !== parentId
    ) {
      return null;
    }

    return (
      <div
        className="flex items-center gap-2 py-1 px-2"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {creationType === "folder" ? (
          <Folder size={16} />
        ) : (
          <FileCode size={16} />
        )}

        <input
          autoFocus
          value={newItemName}
          onChange={(event) =>
            setNewItemName(event.target.value)
          }
          onKeyDown={handleCreationKeyDown}
          onBlur={() => {
            if (newItemName.trim()) {
              finishCreating();
            } else {
              setCreationType(null);
            }
          }}
          placeholder={
            creationType === "file" ? "File name" : "Folder name"
          }
          className="w-full min-w-0 bg-transparent border border-gray-500 outline-none text-white text-xs px-1"
        />
      </div>
    );
  }
  function renderTree(items, level = 0) {
    return items.map((item) => {
      const isFolder = item.type === "folder";
      const isExpanded = expandedFolders.includes(item.id);

      const Icon = isFolder
        ? isExpanded
          ? FolderOpen
          : Folder
        : item.name.endsWith(".md")
          ? FileText
          : FileCode;

      const isSelected =
        activeFile?.id === item.id ||
        selectedFolder === item.id;

      const isRenaming = renamingItemId === item.id;

      return (
        <div key={item.id}>
          <div
            className={`group flex items-center rounded ${
              isSelected
                ? "bg-neutral-700 text-white"
                : "text-gray-400 hover:bg-neutral-800 hover:text-white"
            }`}
            style={{ paddingLeft: `${level * 16}px` }}
          >
            {isRenaming ? (
              <>
                <span className="w-3.5 shrink-0" />

                <Icon size={16} />

                <input
                  autoFocus
                  value={renameInput}
                  onChange={(event) =>
                    setRenameInput(event.target.value)
                  }
                  onKeyDown={handleRenameKeyDown}
                  onBlur={finishRenamingItem}
                  onClick={(event) => event.stopPropagation()}
                  className="flex-1 min-w-0 bg-transparent border border-gray-500 outline-none text-white text-xs px-1"
                />
              </>
            ) : (
              <button
                onClick={() => {
                  if (isFolder) {
                    setSelectedFolder(item.id);
                    toggleFolder(item.id);
                  } else {
                    setSelectedFolder(null);
                    onFileSelect(item);
                  }
                }}
                onDoubleClick={() => startRenamingItem(item)}
                title="Double-click to rename"
                className="flex-1 min-w-0 flex items-center gap-2 py-1 px-2 text-left text-xs"
              >
                {isFolder ? (
                  isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )
                ) : (
                  <span className="w-3.5 shrink-0" />
                )}

                <Icon size={16} />

                <span className="truncate">{item.name}</span>
              </button>
            )}

            <button
              onClick={() => deleteItem(item.id)}
              title="Delete"
              className="hidden group-hover:block p-1 mr-1 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>

          {isFolder && isExpanded && (
            <div>
              {renderCreationInput(item.id, level + 1)}

              {renderTree(item.children || [], level + 1)}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <aside className="w-full h-full min-h-0 bg-[#111] border border-neutral-800 rounded-xl flex flex-col text-gray-300">
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          onClick={() =>
            setIsProjectExpanded((previous) => !previous)
          }
          className="flex items-center gap-2 flex-1 min-w-0 text-left hover:text-white"
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
        </button>

        {isRenamingProject ? (
          <input
            autoFocus
            value={projectNameInput}
            onChange={(event) =>
              setProjectNameInput(event.target.value)
            }
            onKeyDown={handleProjectRenameKeyDown}
            onBlur={finishRenamingProject}
            className="flex-1 min-w-0 bg-transparent border border-gray-500 outline-none text-white text-xs px-1"
          />
        ) : (
          <span
            onDoubleClick={startRenamingProject}
            title="Double-click to rename project"
            className="flex-1 min-w-0 text-xs font-semibold truncate cursor-pointer"
          >
            {projectName}
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            title="New File"
            onClick={() => startCreating("file")}
            className="p-1 hover:text-white hover:bg-neutral-700 rounded"
          >
            <FilePlus size={15} />
          </button>

          <button
            title="New Folder"
            onClick={() => startCreating("folder")}
            className="p-1 hover:text-white hover:bg-neutral-700 rounded"
          >
            <FolderPlus size={15} />
          </button>
        </div>
      </div>
      {isProjectExpanded && (
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide px-2 py-1">
          {renderCreationInput(null, 0)}

          {files.length === 0 && creationType === null && (
            <p className="text-xs text-gray-500 px-6 py-2">
              No files or folders yet.
            </p>
          )}

          {renderTree(files)}
        </div>
      )}
    </aside>
  );
};

export default FileExplorer;
