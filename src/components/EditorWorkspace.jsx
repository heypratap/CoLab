import Editor from "@monaco-editor/react";
function EditorWorkspace({ activeFile, openTabs, files, onFileSelect, onCloseTab, onContentChange,
}) {
  function getLanguage(filename = "") {
    const extension = filename.split(".").pop().toLowerCase();

    const languages = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      py: "python",
      java: "java",
    };

    return languages[extension] || "plaintext";
  }

  function findFileById(items, id) {
    for (const item of items) {
      if (item.id === id) return item;

      if (item.type === "folder") {
        const found = findFileById(item.children || [], id);
        if (found) return found;
      }
    }

    return null;
  }

  const tabFiles = openTabs
    .map((id) => findFileById(files, id))
    .filter(Boolean);

  return (
    <main className="bg-[#1e1e1e] border border-neutral-800 rounded-xl flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">

      <div className="h-10 shrink-0 flex items-center overflow-x-auto border-b border-neutral-800 scrollbar-hide">
        {tabFiles.map((file) => (
          <div
            key={file.id}
            onClick={() => onFileSelect(file.id)}
            className={`group flex items-center gap-3 px-4 h-full border-r border-neutral-800 cursor-pointer text-xs ${activeFile?.id === file.id
              ? "bg-[#1e1e1e] text-white border-t-2 border-t-lime-400"
              : "bg-[#181818] text-gray-400 hover:text-white"
              }`}
          >
            <span>{file.name}</span>

            <button
              onClick={(event) => {
                event.stopPropagation();
                onCloseTab(file.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-neutral-700 rounded px-1"
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {activeFile ? (
        <div className="flex-1 min-h-0">
          <Editor
            key={activeFile.id}
            height="100%"
            theme="vs-dark"
            language={getLanguage(activeFile.name)}
            value={activeFile.content ?? ""}
            onChange={(value) =>
              onContentChange(activeFile.id, value ?? "")
            }
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              automaticLayout: true,
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Select a file to start editing
        </div>
      )}
    </main>
  );
}

export default EditorWorkspace;
