import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import { YJS_URL } from "./config";

function getUserColor(name = "Guest") {
  const colors = [
    "#f87171", "#fb923c", "#fbbf24", "#34d399",
    "#38bdf8", "#818cf8", "#c084fc", "#f472b6"
  ];
  let sum = 0;
  for (let i = 0; i < name.length; i++) {
    sum += name.charCodeAt(i);
  }
  return colors[sum % colors.length];
}

export function connectEditor({ editor, roomName, username, initialContent, onContentChange }) {
  if (!editor || typeof editor.getModel !== "function") {
    return () => {};
  }

  const model = editor.getModel();
  if (!model || model.isDisposed?.()) {
    return () => {};
  }

  let ydoc = null;
  let provider = null;
  let binding = null;
  let onTextChange = null;
  let localDecorations = [];
  const disposables = [];

  try {
    ydoc = new Y.Doc();

    provider = new WebsocketProvider(YJS_URL, roomName, ydoc);

    const userColor = getUserColor(username);

    if (provider.awareness) {
      provider.awareness.setLocalStateField("user", {
        name: username || "Guest",
        color: userColor,
        colorLight: userColor + "33",
      });
    }

    const ytext = ydoc.getText("monaco");

    binding = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      provider.awareness
    );

    function updateLocalCursor() {
      if (!editor || !editor.getModel()) return;
      const pos = editor.getPosition();
      if (!pos || !editor.hasTextFocus()) {
        localDecorations = editor.deltaDecorations(localDecorations, []);
        return;
      }
      localDecorations = editor.deltaDecorations(localDecorations, [
        {
          range: {
            startLineNumber: pos.lineNumber,
            startColumn: pos.column,
            endLineNumber: pos.lineNumber,
            endColumn: pos.column,
          },
          options: {
            beforeContentClassName: "yLocalCursorHead",
          },
        },
      ]);
    }

    disposables.push(editor.onDidChangeCursorPosition(updateLocalCursor));
    disposables.push(editor.onDidFocusEditorWidget(updateLocalCursor));
    disposables.push(
      editor.onDidBlurEditorWidget(() => {
        localDecorations = editor.deltaDecorations(localDecorations, []);
      })
    );

    const styleId = "yjs-cursor-style-" + roomName;
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const safeUsername = (username || "You")
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');

    function updateRemoteCursors() {
      if (!provider || !provider.awareness || !styleTag) return;
      const states = provider.awareness.getStates();

      let cssText = `
        .monaco-editor .view-line {
          overflow: visible !important;
        }
        .monaco-editor .lines-content {
          overflow: visible !important;
        }
        .yLocalCursorHead {
          position: absolute !important;
          border-left: 2px solid ${userColor} !important;
          box-sizing: border-box !important;
          height: 100% !important;
          pointer-events: none !important;
          z-index: 30 !important;
        }
        .yLocalCursorHead::after {
          content: "${safeUsername} (You)" !important;
          position: absolute !important;
          top: -1.4em !important;
          left: -2px !important;
          background-color: ${userColor} !important;
          color: #000000 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          line-height: 1 !important;
          padding: 2px 6px !important;
          border-radius: 3px !important;
          white-space: nowrap !important;
          user-select: none !important;
          pointer-events: none !important;
          z-index: 100 !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6) !important;
        }
      `;

      states.forEach((state, clientId) => {
        if (state && state.user && clientId !== ydoc.clientID) {
          const color = state.user.color || "#38bdf8";
          const displayName = (state.user.name || "Contributor")
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"');

          cssText += `
            .yRemoteSelection-${clientId} {
              background-color: ${color}33 !important;
            }
            .yRemoteSelectionHead-${clientId} {
              position: absolute !important;
              border-left: 2px solid ${color} !important;
              box-sizing: border-box !important;
              height: 100% !important;
              pointer-events: none !important;
              z-index: 20 !important;
            }
            .yRemoteSelectionHead-${clientId}::after {
              content: "${displayName}" !important;
              position: absolute !important;
              top: -1.4em !important;
              left: -2px !important;
              background-color: ${color} !important;
              color: #000000 !important;
              font-size: 11px !important;
              font-weight: 700 !important;
              line-height: 1 !important;
              padding: 2px 6px !important;
              border-radius: 3px !important;
              white-space: nowrap !important;
              user-select: none !important;
              pointer-events: none !important;
              z-index: 100 !important;
              box-shadow: 0 1px 4px rgba(0, 0, 0, 0.6) !important;
            }
          `;
        }
      });

      styleTag.innerHTML = cssText;
    }

    if (provider.awareness) {
      provider.awareness.on("change", updateRemoteCursors);
      updateRemoteCursors();
    }

    onTextChange = () => {
      if (typeof onContentChange === "function") {
        onContentChange(ytext.toString());
      }
    };

    ytext.observe(onTextChange);

    provider.on("sync", (isSynced) => {
      if (isSynced && ytext.length === 0 && initialContent) {
        ytext.insert(0, initialContent);
      }
    });
  } catch (err) {
    console.log("Collab connection error:", err);
  }

  return () => {
    try {
      disposables.forEach((d) => d?.dispose?.());
      if (editor && !editor.getModel()?.isDisposed?.()) {
        editor.deltaDecorations(localDecorations, []);
      }
      const styleTag = document.getElementById("yjs-cursor-style-" + roomName);
      if (styleTag) {
        styleTag.remove();
      }
      if (onTextChange && ydoc) {
        ydoc.getText("monaco").unobserve(onTextChange);
      }
      if (binding) {
        binding.destroy();
      }
      if (provider) {
        provider.destroy();
      }
      if (ydoc) {
        ydoc.destroy();
      }
    } catch (cleanupErr) {
      console.log("Collab cleanup:", cleanupErr);
    }
  };
}
