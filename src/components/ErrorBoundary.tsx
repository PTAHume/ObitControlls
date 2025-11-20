import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('Three.js Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#1a1a1a',
            color: '#fff',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: '#f44336', marginBottom: '1rem' }}>⚠️ 3D Viewer Error</h1>
          <p style={{ marginBottom: '1rem', maxWidth: '600px' }}>
            The 3D viewer encountered an error. This might be due to an incompatible model or
            browser limitation.
          </p>
          <pre
            style={{
              backgroundColor: '#2a2a2a',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              maxWidth: '600px',
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {this.state.error?.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#4a9eff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
