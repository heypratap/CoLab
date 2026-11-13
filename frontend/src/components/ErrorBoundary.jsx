import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full border border-neutral-800 bg-[#111] rounded-2xl p-8">
            <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
            <p className="text-gray-400 text-sm mb-6">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={this.handleReload}
              className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

