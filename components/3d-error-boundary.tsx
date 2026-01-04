"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Box } from "lucide-react"
import { logger } from "@/lib/logger"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  isWebGLSupported: boolean
}

export class ThreeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      isWebGLSupported: this.checkWebGLSupport(),
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error("3D Configurator Error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  checkWebGLSupport(): boolean {
    if (typeof window === 'undefined') {
      return true // Assume supported on server
    }

    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      return !!gl
    } catch {
      return false
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Check if error is due to WebGL not being supported
      const isWebGLError = this.state.error?.message?.includes('WebGL') || 
                          this.state.error?.message?.includes('three') ||
                          !this.state.isWebGLSupported

      if (isWebGLError || !this.state.isWebGLSupported) {
        return (
          <Card className="w-full max-w-lg mx-auto my-8">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Box className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">3D Viewer Not Available</CardTitle>
              <CardDescription className="text-gray-600">
                Your browser doesn&apos;t support WebGL, which is required for the 3D configurator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>To use the 3D configurator:</strong>
                </p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Update your browser to the latest version</li>
                  <li>Enable hardware acceleration in browser settings</li>
                  <li>Try a different browser (Chrome, Firefox, or Edge)</li>
                  <li>Check if your graphics drivers are up to date</li>
                </ul>
              </div>
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </CardContent>
          </Card>
        )
      }

      // Generic error fallback
      return (
        <Card className="w-full max-w-lg mx-auto my-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">3D Viewer Error</CardTitle>
            <CardDescription className="text-gray-600">
              Something went wrong while loading the 3D configurator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-gray-50 p-3 rounded-lg text-xs">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <pre className="mt-2 whitespace-pre-wrap text-red-600">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <div className="flex flex-col space-y-2">
              <Button onClick={this.handleReset} className="bg-orange-500 hover:bg-orange-600">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

