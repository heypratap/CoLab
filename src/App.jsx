import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import Header from "./components/Header";


const App = () => {
  return (
    <div className="h-screen w-full bg-black text-gray-300 p-3 flex flex-col gap-3 font-sans antialiased">
      
      <Header />
      <div className="flex-1 grid grid-cols-[auto_auto_1fr_auto] gap-3 min-h-0">
        <ActivitySidebar />
        <FileExplorer />
        
        <div className="flex flex-col gap-3 min-h-0">
            <EditorWorkspace />
            <BottomPanel />
          </div>
      </div>
      
      <StatusBar />

    </div>
  )
}

export default App;