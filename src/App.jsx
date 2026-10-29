import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import Header from "./components/Header";

const App = () => {
  return (
    <div className="h-screen w-screen bg-black text-gray-300 p-3 flex flex-col gap-3 font-sans selection:bg-purple-500">
      <Header/>
      <div className="flex-1 grid grid-cols-[auto_200px_1fr] gap-3 min-h-0">
      <ActivitySidebar />
      <FileExplorer />
      <EditorWorkspace />
      </div>
      <BottomPanel />
      <StatusBar />
     
    </div>
  )
}

export default App;