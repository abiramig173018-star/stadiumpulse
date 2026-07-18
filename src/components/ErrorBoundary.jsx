import { Component } from "react";

/**
 * Catches render-time errors anywhere below it in the tree so a bug in one
 * widget (e.g. a malformed GenAI response) can't take down the whole
 * dashboard with a blank white screen. Live crowd data stays visible even
 * if, say, the briefing panel throws.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("StadiumPulse UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-300">
          Something went wrong displaying this section. Try refreshing the page.
        </div>
      );
    }
    return this.props.children;
  }
}
