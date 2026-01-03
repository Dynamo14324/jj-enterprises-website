"use client"

import { useEffect } from "react"
import { useRef } from "react"
import { useState, useCallback, useMemo, Suspense, lazy } from "react"
import dynamic from "next/dynamic"
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  Share2,
  RotateCcw,
  Save,
  Eye,
  Package,
  Palette,
  Ruler,
  Settings,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Zap,
  Calculator,
  ShoppingCart,
  Heart,
  Star,
  Layers,
  Box,
  PaintBucket,
  Wrench,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ThreeErrorBoundary } from "@/components/3d-error-boundary"

// Lazy load the 3D canvas component
const LazyCanvas = dynamic(
  () => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 3D Viewer...</p>
        </div>
      </div>
    ),
  }
)

// Enhanced 3D Box Component with perfect synchronization
function ConfigurableBox3D({
  config,
  isAnimating,
  viewMode,
  onAnimationComplete,
}: {
  config: BoxConfiguration
  isAnimating: boolean
  viewMode: "flat" | "assembled"
  onAnimationComplete: () => void
}) {
  const boxRef = useRef<THREE.Group>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Calculate box geometry based on configuration
  const geometry = useMemo(() => {
    const { width, height, depth, thickness } = config.dimensions
    return {
      width: width / 100, // Convert to meters for 3D
      height: height / 100,
      depth: depth / 100,
      thickness: thickness / 1000,
    }
  }, [config.dimensions])

  // Material properties based on configuration
  const materialProps = useMemo(() => {
    const baseProps = {
      roughness: config.material === "kraft" ? 0.8 : 0.3,
      metalness: 0.1,
    }

    switch (config.finish) {
      case "matte":
        return { ...baseProps, roughness: 0.9 }
      case "glossy":
        return { ...baseProps, roughness: 0.1, metalness: 0.2 }
      case "satin":
        return { ...baseProps, roughness: 0.5 }
      default:
        return baseProps
    }
  }, [config.material, config.finish])

  useFrame((state) => {
    if (boxRef.current && isAnimating) {
      boxRef.current.rotation.y += 0.01
    }
  })

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
      onAnimationComplete()
    }, 500)
    return () => clearTimeout(timer)
  }, [config, onAnimationComplete])

  return (
    <group ref={boxRef}>
      {/* Main Box Structure */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[geometry.width, geometry.height, geometry.depth]} />
        <meshStandardMaterial
          color={config.color}
          {...materialProps}
          transparent={config.finish === "transparent"}
          opacity={config.finish === "transparent" ? 0.8 : 1}
        />
      </mesh>

      {/* Box Style Specific Elements */}
      {config.style === "mailer" && (
        <>
          {/* Flap elements for mailer box */}
          <mesh
            position={[0, geometry.height / 2 + 0.01, 0]}
            rotation={[viewMode === "flat" ? -Math.PI / 2 : -Math.PI / 6, 0, 0]}
          >
            <boxGeometry args={[geometry.width, 0.02, geometry.depth * 0.3]} />
            <meshStandardMaterial color={config.color} {...materialProps} />
          </mesh>
        </>
      )}

      {config.style === "gift" && (
        <>
          {/* Ribbon for gift box */}
          <mesh position={[0, 0, geometry.depth / 2 + 0.01]}>
            <boxGeometry args={[geometry.width + 0.02, 0.05, 0.02]} />
            <meshStandardMaterial color="#ff6b6b" metalness={0.3} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, geometry.depth / 2 + 0.01]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[geometry.depth + 0.02, 0.05, 0.02]} />
            <meshStandardMaterial color="#ff6b6b" metalness={0.3} roughness={0.2} />
          </mesh>
        </>
      )}

      {/* Printing/Graphics Simulation */}
      {config.printing && (
        <mesh position={[0, 0, geometry.depth / 2 + 0.001]}>
          <planeGeometry args={[geometry.width * 0.8, geometry.height * 0.6]} />
          <meshStandardMaterial color="#333333" transparent opacity={0.7} />
        </mesh>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <mesh position={[0, geometry.height / 2 + 0.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#ff6b35" emissive="#ff6b35" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// Enhanced Loading Component
function Enhanced3DLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-orange-50/90 to-amber-50/90 backdrop-blur-sm rounded-lg">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-orange-600" />
        </div>
        <p className="text-lg font-semibold text-gray-800 mb-2">Rendering 3D Model</p>
        <p className="text-sm text-gray-600">Applying your configuration...</p>
      </div>
    </div>
  )
}

// Configuration interfaces
interface BoxConfiguration {
  dimensions: {
    width: number
    height: number
    depth: number
    thickness: number
  }
  style: "shipping" | "mailer" | "gift" | "food" | "pharma" | "custom"
  material: "corrugated" | "kraft" | "cardboard" | "rigid"
  color: string
  finish: "matte" | "glossy" | "satin" | "transparent"
  printing: boolean
  quantity: number
  customText: string
}

export default function ConfiguratorPage() {
  const { toast } = useToast()

  // Enhanced state management
  const [config, setConfig] = useState<BoxConfiguration>({
    dimensions: { width: 20, height: 15, depth: 10, thickness: 3 },
    style: "shipping",
    material: "corrugated",
    color: "#8B4513",
    finish: "matte",
    printing: false,
    quantity: 100,
    customText: "",
  })

  const [viewMode, setViewMode] = useState<"flat" | "assembled">("assembled")
  const [isAnimating, setIsAnimating] = useState(false)
  const [configChanged, setConfigChanged] = useState(false)
  const [savedConfigs, setSavedConfigs] = useState<BoxConfiguration[]>([])
  const [activeTab, setActiveTab] = useState("dimensions")
  const [isLoading, setIsLoading] = useState(false)

  // Enhanced configuration update handler
  const updateConfig = useCallback((updates: Partial<BoxConfiguration>) => {
    setConfig((prev) => {
      const newConfig = { ...prev, ...updates }
      setConfigChanged(true)
      setIsLoading(true)

      // Reset loading after animation
      setTimeout(() => {
        setIsLoading(false)
        setConfigChanged(false)
      }, 800)

      return newConfig
    })
  }, [])

  // Calculated properties
  const calculatedVolume = useMemo(() => {
    const { width, height, depth } = config.dimensions
    return ((width * height * depth) / 1000000).toFixed(3) // Convert to liters
  }, [config.dimensions])

  const estimatedPrice = useMemo(() => {
    const basePrice = 15
    const volumeMultiplier = Number.parseFloat(calculatedVolume) * 2
    const materialMultiplier = config.material === "rigid" ? 1.5 : 1
    const styleMultiplier = config.style === "gift" ? 1.3 : 1
    const finishMultiplier = config.finish === "glossy" ? 1.2 : 1

    return Math.round(basePrice + volumeMultiplier * materialMultiplier * styleMultiplier * finishMultiplier)
  }, [config, calculatedVolume])

  const totalPrice = useMemo(() => {
    return estimatedPrice * config.quantity
  }, [estimatedPrice, config.quantity])

  // Action handlers
  const handleSaveConfiguration = useCallback(() => {
    setSavedConfigs((prev) => [...prev, { ...config }])
    toast({
      title: "Configuration Saved!",
      description: "Your box configuration has been saved successfully.",
    })
  }, [config, toast])

  const handleResetConfiguration = useCallback(() => {
    setConfig({
      dimensions: { width: 20, height: 15, depth: 10, thickness: 3 },
      style: "shipping",
      material: "corrugated",
      color: "#8B4513",
      finish: "matte",
      printing: false,
      quantity: 100,
      customText: "",
    })
    toast({
      title: "Configuration Reset",
      description: "All settings have been reset to default values.",
    })
  }, [toast])

  const handleExportConfiguration = useCallback(() => {
    const configData = {
      ...config,
      volume: calculatedVolume,
      estimatedPrice,
      totalPrice,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `box-configuration-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Configuration Exported!",
      description: "Your configuration has been downloaded as a JSON file.",
    })
  }, [config, calculatedVolume, estimatedPrice, totalPrice, toast])

  const handleGetQuote = useCallback(() => {
    const quoteData = {
      configuration: config,
      volume: calculatedVolume,
      estimatedPrice,
      totalPrice,
      timestamp: new Date().toISOString(),
    }

    // Store in localStorage for quote page
    localStorage.setItem("boxQuoteData", JSON.stringify(quoteData))

    toast({
      title: "Quote Request Prepared!",
      description: "Redirecting to get your detailed quote...",
    })
  }, [config, calculatedVolume, estimatedPrice, totalPrice, toast])

  // Force re-render key for 3D component
  const renderKey = useMemo(
    () =>
      `${config.dimensions.width}-${config.dimensions.height}-${config.dimensions.depth}-${config.style}-${config.material}-${config.color}-${config.finish}-${viewMode}`,
    [config, viewMode],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 pt-20">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-white/20 text-white border-white/30 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Interactive 3D Design Tool
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">3D Box Configurator</h1>
            <p className="text-xl text-white/90 mb-8">
              Design your perfect packaging solution with real-time 3D visualization. Customize dimensions, materials,
              colors, and see instant pricing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
                <Eye className="w-5 h-5 mr-2" />
                <span>Real-time Preview</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
                <Calculator className="w-5 h-5 mr-2" />
                <span>Instant Pricing</span>
              </div>
              <div className="flex items-center bg-white/20 rounded-lg px-4 py-2">
                <Download className="w-5 h-5 mr-2" />
                <span>Export Design</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Configuration Status Bar */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Box className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium">
                    {config.dimensions.width}×{config.dimensions.height}×{config.dimensions.depth}cm
                  </span>
                </div>
                <div className="flex items-center">
                  <PaintBucket className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium capitalize">{config.material}</span>
                </div>
                <div className="flex items-center">
                  <Layers className="w-5 h-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium">{calculatedVolume}L</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium">₹{estimatedPrice}/unit</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {configChanged && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Updating...
                  </Badge>
                )}
                {!configChanged && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Synced
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced 3D Configurator */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] shadow-xl border-2 border-gray-200 hover:border-orange-300 transition-all duration-300">
              <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-t-lg border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center text-xl">
                      <Package className="w-6 h-6 mr-2 text-orange-600" />
                      3D Preview
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">Interactive 3D model of your custom box design</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={viewMode === "assembled" ? "default" : "secondary"}>
                      {viewMode === "assembled" ? "Assembled" : "Flat"}
                    </Badge>
                    {isLoading && (
                      <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                </div>

                {/* Enhanced Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={viewMode === "assembled" ? "default" : "outline"}
                      onClick={() => setViewMode("assembled")}
                      className="text-xs"
                    >
                      <Box className="w-3 h-3 mr-1" />
                      Assembled
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === "flat" ? "default" : "outline"}
                      onClick={() => setViewMode("flat")}
                      className="text-xs"
                    >
                      <Layers className="w-3 h-3 mr-1" />
                      Flat
                    </Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAnimating(!isAnimating)}
                      className="text-xs"
                    >
                      {isAnimating ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                      {isAnimating ? "Pause" : "Rotate"}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetConfiguration}
                      className="text-xs bg-transparent"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSaveConfiguration}
                      className="text-xs bg-transparent"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportConfiguration}
                      className="text-xs bg-transparent"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 h-[calc(100%-140px)] relative">
                {/* Loading Overlay */}
                {isLoading && <Enhanced3DLoader />}

                {/* 3D Canvas with perfect synchronization and error boundary */}
                <ThreeErrorBoundary>
                  <Suspense
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
                        <div className="text-center">
                          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                          <p className="text-gray-600">Initializing 3D Viewer...</p>
                        </div>
                      </div>
                    }
                  >
                    <LazyCanvas
                      key={renderKey} // Force re-render on config changes
                      camera={{ position: [5, 5, 5], fov: 50 }}
                      className="w-full h-full rounded-b-lg"
                      gl={{ antialias: true, alpha: true }}
                    >
                  <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} />
                    <spotLight position={[0, 10, 0]} intensity={0.8} castShadow />

                    <ConfigurableBox3D
                      config={config}
                      isAnimating={isAnimating}
                      viewMode={viewMode}
                      onAnimationComplete={() => setConfigChanged(false)}
                    />

                    <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />

                    <Environment preset="warehouse" background={false} />

                    <OrbitControls
                      enableZoom={true}
                      enablePan={true}
                      autoRotate={false}
                      maxPolarAngle={Math.PI / 2}
                      minPolarAngle={Math.PI / 6}
                      minDistance={3}
                      maxDistance={20}
                      enableDamping={true}
                      dampingFactor={0.05}
                    />
                  </Suspense>
                    </LazyCanvas>
                  </Suspense>
                </ThreeErrorBoundary>

                {/* 3D Controls Overlay */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <span>Drag to rotate</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Scroll to zoom</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                      <span>Right-click to pan</span>
                    </div>
                  </div>
                </div>

                {/* Configuration Status Indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                  <div className="flex items-center space-x-2">
                    {configChanged ? (
                      <>
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600">Updating...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">Live</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Configuration Panel */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-orange-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{calculatedVolume}L</div>
                    <div className="text-xs text-gray-600">Volume</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">₹{estimatedPrice}</div>
                    <div className="text-xs text-gray-600">Per Unit</div>
                  </div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">₹{totalPrice.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Total ({config.quantity} units)</div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Configuration Tabs */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-600" />
                  Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="dimensions" className="text-xs">
                      <Ruler className="w-3 h-3 mr-1" />
                      Size
                    </TabsTrigger>
                    <TabsTrigger value="style" className="text-xs">
                      <Box className="w-3 h-3 mr-1" />
                      Style
                    </TabsTrigger>
                    <TabsTrigger value="material" className="text-xs">
                      <Layers className="w-3 h-3 mr-1" />
                      Material
                    </TabsTrigger>
                    <TabsTrigger value="finish" className="text-xs">
                      <Palette className="w-3 h-3 mr-1" />
                      Finish
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dimensions" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Width (cm)</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <Slider
                            value={[config.dimensions.width]}
                            onValueChange={([value]) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, width: value },
                              })
                            }
                            max={100}
                            min={5}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={config.dimensions.width}
                            onChange={(e) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, width: Number(e.target.value) },
                              })
                            }
                            className="w-16 text-sm"
                            min={5}
                            max={100}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Height (cm)</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <Slider
                            value={[config.dimensions.height]}
                            onValueChange={([value]) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, height: value },
                              })
                            }
                            max={100}
                            min={5}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={config.dimensions.height}
                            onChange={(e) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, height: Number(e.target.value) },
                              })
                            }
                            className="w-16 text-sm"
                            min={5}
                            max={100}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Depth (cm)</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <Slider
                            value={[config.dimensions.depth]}
                            onValueChange={([value]) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, depth: value },
                              })
                            }
                            max={100}
                            min={5}
                            step={1}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={config.dimensions.depth}
                            onChange={(e) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, depth: Number(e.target.value) },
                              })
                            }
                            className="w-16 text-sm"
                            min={5}
                            max={100}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Thickness (mm)</Label>
                        <div className="flex items-center space-x-3 mt-2">
                          <Slider
                            value={[config.dimensions.thickness]}
                            onValueChange={([value]) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, thickness: value },
                              })
                            }
                            max={10}
                            min={1}
                            step={0.5}
                            className="flex-1"
                          />
                          <Input
                            type="number"
                            value={config.dimensions.thickness}
                            onChange={(e) =>
                              updateConfig({
                                dimensions: { ...config.dimensions, thickness: Number(e.target.value) },
                              })
                            }
                            className="w-16 text-sm"
                            min={1}
                            max={10}
                            step={0.5}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="style" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Box Style</Label>
                      <Select value={config.style} onValueChange={(value: any) => updateConfig({ style: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shipping">Shipping Box</SelectItem>
                          <SelectItem value="mailer">Mailer Box</SelectItem>
                          <SelectItem value="gift">Gift Box</SelectItem>
                          <SelectItem value="food">Food Box</SelectItem>
                          <SelectItem value="pharma">Pharmaceutical</SelectItem>
                          <SelectItem value="custom">Custom Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Quantity</Label>
                      <div className="flex items-center space-x-3">
                        <Slider
                          value={[config.quantity]}
                          onValueChange={([value]) => updateConfig({ quantity: value })}
                          max={10000}
                          min={50}
                          step={50}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={config.quantity}
                          onChange={(e) => updateConfig({ quantity: Number(e.target.value) })}
                          className="w-20 text-sm"
                          min={50}
                          max={10000}
                          step={50}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Add Printing</Label>
                      <Switch
                        checked={config.printing}
                        onCheckedChange={(checked) => updateConfig({ printing: checked })}
                      />
                    </div>

                    {config.printing && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Custom Text</Label>
                        <Textarea
                          value={config.customText}
                          onChange={(e) => updateConfig({ customText: e.target.value })}
                          placeholder="Enter custom text for printing..."
                          className="text-sm"
                          rows={3}
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="material" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Material Type</Label>
                      <Select value={config.material} onValueChange={(value: any) => updateConfig({ material: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corrugated">Corrugated Cardboard</SelectItem>
                          <SelectItem value="kraft">Kraft Paper</SelectItem>
                          <SelectItem value="cardboard">Standard Cardboard</SelectItem>
                          <SelectItem value="rigid">Rigid Board</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">Strength</div>
                        <div className="text-gray-600">
                          {config.material === "rigid"
                            ? "Very High"
                            : config.material === "corrugated"
                              ? "High"
                              : config.material === "cardboard"
                                ? "Medium"
                                : "Low"}
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">Cost</div>
                        <div className="text-gray-600">
                          {config.material === "rigid"
                            ? "Premium"
                            : config.material === "corrugated"
                              ? "Standard"
                              : config.material === "cardboard"
                                ? "Economy"
                                : "Budget"}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="finish" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Color</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {[
                          "#8B4513",
                          "#D2691E",
                          "#CD853F",
                          "#F4A460",
                          "#FFFFFF",
                          "#F5F5DC",
                          "#FFE4B5",
                          "#FFEFD5",
                          "#E6E6FA",
                          "#F0F8FF",
                          "#F5FFFA",
                          "#FFF8DC",
                        ].map((color) => (
                          <button
                            key={color}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              config.color === color ? "border-gray-800 scale-110" : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => updateConfig({ color })}
                          />
                        ))}
                      </div>
                      <Input
                        type="color"
                        value={config.color}
                        onChange={(e) => updateConfig({ color: e.target.value })}
                        className="w-full h-10 mt-2"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-medium mb-3 block">Surface Finish</Label>
                      <Select value={config.finish} onValueChange={(value: any) => updateConfig({ finish: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="matte">Matte Finish</SelectItem>
                          <SelectItem value="glossy">Glossy Finish</SelectItem>
                          <SelectItem value="satin">Satin Finish</SelectItem>
                          <SelectItem value="transparent">Transparent Coating</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg text-xs">
                      <div className="font-medium text-blue-800 mb-1">Finish Effects:</div>
                      <div className="text-blue-600">
                        {config.finish === "matte" && "Reduces glare, premium feel"}
                        {config.finish === "glossy" && "High shine, vibrant colors"}
                        {config.finish === "satin" && "Balanced shine, smooth texture"}
                        {config.finish === "transparent" && "Clear protective coating"}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              <Link href="/contact" className="block">
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
                  onClick={handleGetQuote}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Get Quote - ₹{totalPrice.toLocaleString()}
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleSaveConfiguration} className="py-2 bg-transparent">
                  <Heart className="w-4 h-4 mr-2" />
                  Save Design
                </Button>
                <Button variant="outline" onClick={handleExportConfiguration} className="py-2 bg-transparent">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              <div className="text-center text-xs text-gray-500 space-y-1">
                <p>💡 Prices are estimates. Final quote may vary based on specifications.</p>
                <p>🚚 Free shipping on orders above ₹10,000</p>
                <p>⚡ Express delivery available in major cities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Features Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Real-time 3D Preview</h3>
            <p className="text-sm text-gray-600">
              See your box design come to life with interactive 3D visualization that updates instantly as you make
              changes.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Instant Pricing</h3>
            <p className="text-sm text-gray-600">
              Get accurate pricing estimates based on your exact specifications, including volume discounts and material
              costs.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Full Customization</h3>
            <p className="text-sm text-gray-600">
              Complete control over dimensions, materials, colors, finishes, and printing options for your perfect box.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
