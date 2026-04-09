import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-zinc-950 px-6 py-8 gap-3">
          <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-800/50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <p className="text-xs font-semibold text-zinc-300">
            {this.props.label || 'Module'} Offline
          </p>
          <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
            An unexpected error occurred. Attempting to reconnect.
          </p>
          <button
            onClick={this.handleRetry}
            className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors px-3 py-2"
          >
            <RefreshCw size={10} />
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
