import Editor from "@monaco-editor/react";

function EditorWorkspace({ activeFile }) {
  const getLanguage = (filename = "") => {
    const extension = filename.split(".").pop();

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
  };

  return (
    <main className="bg-[#1e1e1e] border border-neutral-800 rounded-xl flex-1 min-h-0 min-w-0 overflow-hidden flex flex-col">
      {activeFile ? (
        <>
          <div className="h-10 flex items-center px-4 border-b border-neutral-800 text-sm text-gray-300">
            {activeFile.name}
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              theme="vs-dark"
              language={getLanguage(activeFile.name)}
              value={activeFile.content || ""}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                automaticLayout: true,
                wordWrap: "on",
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Select a file to start editing
        </div>
      )}
    </main>
  );
}

export default EditorWorkspace;
