import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import Header from "./components/Header";
import { useState } from "react";


const App = () => {

  const [activeFile, setActiveFile] = useState(null);

  return (
    <div className="h-screen w-full bg-black text-white p-3 flex flex-col gap-3 font-sans antialiased">

      <Header />
      <div className="flex-1 grid grid-cols-[48px_240px_minmax(0,1fr)] gap-3 min-h-0">
        <ActivitySidebar />
        <FileExplorer
          activeFile={activeFile}
          onFileSelect={setActiveFile}
        />

        <div className="flex flex-col gap-3 min-h-0 min-w-0">
          <EditorWorkspace activeFile={activeFile} />
          <BottomPanel />
        </div>
      </div>

      <StatusBar />

    </div>
  )
}

export default App;