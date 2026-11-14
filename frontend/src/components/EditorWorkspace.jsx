import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, X } from "lucide-react";
import { connectEditor } from "../services/collaboration";

function EditorWorkspace({
  activeFile,
  openTabs,
  files,
  onFileSelect,
  onCloseTab,
  onContentChange,
  onRun,
  username,
  projectId,
}) {
  const [editor, setEditor] = useState(null);
  const monacoRef = useRef(null);
  const onContentChangeRef = useRef(onContentChange);

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  });

  function getLanguage(filename = "") {
    const ext = filename.split(".").pop().toLowerCase();
    const map = {
      js: "javascript", jsx: "javascript",
      ts: "typescript", tsx: "typescript",
      html: "html", css: "css",
      json: "json", md: "markdown",
      py: "python", java: "java",
    };
    return map[ext] || "plaintext";
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

  const tabFiles = openTabs.map((id) => findFileById(files, id)).filter(Boolean);

  const isJavaScriptFile = ["js", "jsx"].includes(
    activeFile?.name?.split(".").pop().toLowerCase()
  );

  const activeFileId = activeFile?.id;
  const activeFileName = activeFile?.name;
  const activeFileContent = activeFile?.content ?? "";

  function handleMount(editorInstance, monacoInstance) {
    monacoRef.current = monacoInstance;
    setEditor(editorInstance);
  }

  useEffect(() => {
    if (!editor || !activeFileId) return;

    const model = editor.getModel();
    if (model && monacoRef.current && activeFileName) {
      try {
        monacoRef.current.editor.setModelLanguage(model, getLanguage(activeFileName));
      } catch (e) {
        console.warn("Language update error:", e);
      }
    }

    const cleanup = connectEditor({
      editor,
      roomName: `${projectId || "project"}-${activeFileId}`,
      username: username || "Anonymous",
      initialContent: activeFileContent,
      onContentChange: (content) => {
        onContentChangeRef.current?.(activeFileId, content);
      },
    });

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, activeFileId, username]);

  return (
    <main className="bg-[#111] border border-neutral-800 rounded-xl flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
      {}
      <div className="h-10 shrink-0 flex items-center justify-between border-b border-neutral-800">
        <div className="flex-1 min-w-0 h-full flex items-center overflow-x-auto scrollbar-hide">
          {tabFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onFileSelect(file.id)}
              className={`group flex items-center gap-2 px-4 h-full border-r border-neutral-800 cursor-pointer text-xs select-none ${
                activeFile?.id === file.id
                  ? "bg-[#111] text-white border-t-2 border-t-white"
                  : "bg-[#0a0a0a] text-gray-500 hover:text-gray-300"
              }`}
            >
              <span>{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:bg-neutral-700 rounded p-0.5"
                title="Close tab"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>

        <div className="px-3 shrink-0">
          <button
            onClick={() => onRun(activeFile)}
            disabled={!activeFile || !isJavaScriptFile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white text-black text-xs font-semibold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
            title="Run JavaScript"
          >
            <Play size={12} fill="currentColor" />
            Run
          </button>
        </div>
      </div>

      {}
      <div className="flex-1 min-h-0 relative">
        {activeFile ? (
          <Editor
            height="100%"
            theme="vs-dark"
            language={getLanguage(activeFile.name)}
            defaultValue={activeFileContent}
            onMount={handleMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "Inter, monospace",
              automaticLayout: true,
              wordWrap: "on",
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              renderLineHighlight: "line",
              padding: { top: 12 },
            }}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-2 select-none">
            <span className="text-2xl">←</span>
            <p className="text-sm">Select a file from the explorer to view and edit</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default EditorWorkspace;
