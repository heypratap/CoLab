
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

export function connectEditor({ editor, roomName, initialContent, onContentChange }) {
    const ydoc = new Y.Doc();

    const provider = new WebsocketProvider(
        "ws://localhost:1234", roomName, ydoc);

    const ytext = ydoc.getText("monaco");
    const model = editor.getModel();

    const binding = new MonacoBinding(ytext, model, new Set([editor]), provider.awareness);

    function handleTextChange() {
        onContentChange(ytext.toString());
    }

    ytext.observe(handleTextChange);

    provider.on("sync", (isSynced) => {
        if (isSynced && ytext.length === 0 && initialContent) {
            ytext.insert(0, initialContent);
        }
    });

    return () => {
        ytext.unobserve(handleTextChange);
        binding.destroy();
        provider.destroy();
        ydoc.destroy();
    };
}
