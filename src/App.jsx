import ActivitySidebar from "./components/ActivitySidebar";
import FileExplorer from "./components/FileExplorer";
import EditorWorkspace from "./components/EditorWorkspace";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";

const App = () => {
  return (
    <>
      <ActivitySidebar />
      <FileExplorer />
      <EditorWorkspace />
      <BottomPanel />
      <StatusBar />

    </>
  )
}

export default App;