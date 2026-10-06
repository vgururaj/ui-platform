import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from './alert';
import { Button } from './button';

interface Props {
  children: ReactNode;
  /** Optional title override */
  title?: string;
}

interface State {
  error: Error | null;
}

/** Catch render errors in a route subtree and show a recoverable alert. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Alert variant="destructive" data-testid="error-boundary">
          <AlertTitle>{this.props.title ?? 'Something went wrong'}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>{this.state.error.message}</p>
            <Button size="sm" variant="outline" onClick={() => this.setState({ error: null })}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}
