
import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Play } from "lucide-react";
import { connectEditor } from "../services/collaboration";

function EditorWorkspace({
  activeFile,
  openTabs,
  files,
  onFileSelect,
  onCloseTab,
  onContentChange,
  onRun,
}) {
  const [editorInstance, setEditorInstance] = useState(null);
  const onContentChangeRef = useRef(onContentChange);

  onContentChangeRef.current = onContentChange;

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

  const isJavaScriptFile = ["js", "jsx"].includes(
    activeFile?.name.split(".").pop().toLowerCase()
  );

  useEffect(() => {
    if (!editorInstance || !activeFile) return;

    const cleanup = connectEditor({
      editor: editorInstance,
      roomName: `colab-test-${activeFile.id}`,
      initialContent: activeFile.content ?? "",
      onContentChange: (content) => {
        onContentChangeRef.current(activeFile.id, content);
      },
    });

    return cleanup;
  }, [editorInstance, activeFile?.id]);

  return (
    <main className="bg-[#1e1e1e] border border-neutral-800 rounded-xl flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
      <div className="h-10 shrink-0 flex items-center justify-between border-b border-neutral-800">
        <div className="flex-1 min-w-0 h-full flex items-center overflow-x-auto scrollbar-hide">
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

        <div className="px-3 shrink-0">
          <button
            onClick={() => onRun(activeFile)}
            disabled={!activeFile || !isJavaScriptFile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-lime-500 text-black text-xs font-semibold hover:bg-lime-400 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Run JavaScript"
          >
            <Play size={13} fill="currentColor" />
            Run
          </button>
        </div>
      </div>

      {activeFile ? (
        <div className="flex-1 min-h-0">
          <Editor
            key={activeFile.id}
            height="100%"
            theme="vs-dark"
            language={getLanguage(activeFile.name)}
            defaultValue=""
            onMount={(editor) => setEditorInstance(editor)}
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
