import { Component } from 'react';

// Catches errors thrown while rendering anything inside it and shows a recovery screen
// instead of a blank page. (Error boundaries must be class components.)
// It does NOT catch errors in event handlers or fetch callbacks; those set error state.
export default class ErrorBoundary extends Component {
  // error = the thrown error, or null when everything is fine
  state = { error: null };

  // React calls this when a child throws while rendering: save the error to show the fallback
  static getDerivedStateFromError(error) {
    return { error };
  }

  // log the error and which component it came from (for debugging)
  componentDidCatch(error, info) {
    console.error('Render error caught by ErrorBoundary:', error, info.componentStack);
  }

  render() {
    // no error: show the app normally
    if (!this.state.error) return this.props.children;

    // error: show a message + ways to recover (retry, or go back home)
    return (
      <div className="page status" role="alert">
        <h2>Something went wrong.</h2>
        <p className="error">{this.state.error.message}</p>
        <button type="button" onClick={() => this.setState({ error: null })}>Try again</button>{' '}
        <button type="button" onClick={() => window.location.assign('/')}>Back to listings</button>
      </div>
    );
  }
}
