
import { useState } from "react";
import {
    FolderCode, Plus, Clock3, Code2, X,
} from "lucide-react";

function countFiles(items = []) {
    return items.reduce((total, item) => {
        if (item.type === "file") {
            return total + 1;
        }
        if (item.type === "folder") {
            return total + countFiles(item.children || []);
        }
        return total;
    }, 0);
}

const ProjectDashboard = ({
    projects,
    onOpenProject,
    onCreateProject,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectName, setProjectName] = useState("");

    function handleCreateProject(event) {
        event.preventDefault();

        const trimmedName = projectName.trim();

        if (!trimmedName) return;

        onCreateProject(trimmedName);
        setProjectName("");
        setIsModalOpen(false);
    }

    return (
        <div className="min-h-screen w-full bg-[#0a0a0a] text-white p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-20">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center">
                            <Code2 size={23} className="text-black" />
                        </div>

                        <span className="text-xl font-semibold tracking-tight">
                            colab
                        </span>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition"
                    >
                        <Plus size={17} />
                        New Project
                    </button>
                </header>
                <section className="mb-14">
                    <p className="text-sm text-gray-500 mb-3">
                        YOUR WORKSPACE
                    </p>

                    <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
                        Welcome back.
                    </h1>

                    <p className="text-gray-400 text-sm md:text-base">
                        Pick up where you left off or start something new.
                    </p>
                </section>
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium">
                            Recent Projects
                        </h2>
                        <span className="text-xs text-gray-500">
                            {projects.length} projects
                        </span>
                    </div>
                    {projects.length === 0 ? (
                        <div className="border border-dashed border-[#303030] rounded-xl p-12 text-center">
                            <FolderCode
                                size={32}
                                className="mx-auto mb-4 text-gray-500"
                            />

                            <p className="text-gray-300 mb-2">
                                No projects yet
                            </p>

                            <p className="text-sm text-gray-500 mb-5">
                                Create your first project to get started.
                            </p>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition"
                            >
                                Create Project
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="group border border-[#262626] bg-[#111111] rounded-xl p-5 hover:border-[#444444] transition"
                                >
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="h-11 w-11 rounded-lg bg-[#1c1c1c] flex items-center justify-center">
                                            <FolderCode
                                                size={22}
                                                className="text-gray-300"
                                            />
                                        </div>

                                        <span className="text-xs text-gray-500">
                                            {project.updatedAt || "Recently created"}
                                        </span>
                                    </div>

                                    <h3 className="text-base font-medium mb-2 truncate">
                                        {project.name}
                                    </h3>

                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
                                        <FolderCode size={14} />
                                        <span>
                                            {countFiles(project.files)} files
                                        </span>

                                        <span className="text-[#444444]">•</span>

                                        <Clock3 size={13} />
                                        <span>Project</span>
                                    </div>

                                    <button
                                        onClick={() => onOpenProject(project.id)}
                                        className="w-full rounded-lg border border-[#303030] py-2.5 text-sm text-gray-300 hover:bg-white hover:text-black hover:border-white transition"
                                    >
                                        Open Project
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <footer className="mt-20 border-t border-[#202020] pt-6">
                    <p className="text-xs text-gray-600">
                        CoLab — Your space to build together.
                    </p>
                </footer>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-md rounded-xl border border-[#303030] bg-[#111111] p-6 shadow-2xl">

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">
                                Create New Project
                            </h2>

                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setProjectName("");
                                }}
                                className="text-gray-500 hover:text-white transition"
                                aria-label="Close modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject}>
                            <label
                                htmlFor="projectName"
                                className="block text-sm text-gray-400 mb-2"
                            >
                                Project Name
                            </label>

                            <input
                                id="projectName"
                                type="text"
                                value={projectName}
                                onChange={(event) =>
                                    setProjectName(event.target.value)
                                }
                                placeholder="e.g. Portfolio Website"
                                autoFocus
                                className="w-full rounded-lg border border-[#303030] bg-[#0a0a0a] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-gray-500"
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setProjectName("");
                                    }}
                                    className="px-4 py-2.5 rounded-lg border border-[#303030] text-sm text-gray-300 hover:bg-[#1c1c1c] transition"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={!projectName.trim()}
                                    className="px-4 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    Create Project
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDashboard;
