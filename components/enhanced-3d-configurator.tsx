"use client"

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'

// Box style definitions
export const BOX_STYLES = {
  rsc: {
    name: "Regular Slotted Container",
    description: "Standard shipping box with four flaps on top and bottom",
    foldingSequence: ['bottom', 'sides', 'top'],
    complexity: 'simple'
  },
  autoBottom: {
    name: "Auto Bottom Box",
    description: "Self-locking bottom, convenient for packing",
    foldingSequence: ['bottom-lock', 'sides', 'top'],
    complexity: 'medium'
  },
  display: {
    name: "Display Box",
    description: "Retail display box with advertisement panel",
    foldingSequence: ['base', 'display-panel', 'sides'],
    complexity: 'medium'
  },
  drawer: {
    name: "Drawer Box",
    description: "Slide-out drawer style box",
    foldingSequence: ['outer-sleeve', 'inner-drawer'],
    complexity: 'complex'
  },
  folding: {
    name: "Folding Box",
    description: "One-piece folding box without glue",
    foldingSequence: ['base-fold', 'side-tabs', 'lock-tabs'],
    complexity: 'medium'
  },
  gableTop: {
    name: "Gable Top Box",
    description: "Milk carton style with peaked top",
    foldingSequence: ['base', 'sides', 'gable-fold'],
    complexity: 'complex'
  },
  pillow: {
    name: "Pillow Box",
    description: "Curved pillow-shaped packaging",
    foldingSequence: ['curve-sides', 'end-tucks'],
    complexity: 'simple'
  },
  tuckEnd: {
    name: "Tuck End Box",
    description: "Boxes with tuck-in flaps on ends",
    foldingSequence: ['bottom', 'sides', 'tuck-ends'],
    complexity: 'simple'
  },
  hingedLid: {
    name: "Hinged Lid Box",
    description: "Premium box with attached hinged lid",
    foldingSequence: ['base', 'hinge', 'lid'],
    complexity: 'complex'
  }
}

// Enhanced 3D Box Component with folding animations
function Enhanced3DBox({ 
  style = 'rsc',
  dimensions = { length: 30, width: 20, height: 15, thickness: 0.3 },
  material = 'corrugated',
  color = '#D4A574',
  foldingState = 'assembled', // 'flat', 'folding', 'assembled'
  animationProgress = 0,
  showFoldLines = true,
  onFoldingComplete,
  ...props 
}) {
  const groupRef = useRef()
  const [currentStyle, setCurrentStyle] = useState(style)
  const [isAnimating, setIsAnimating] = useState(false)

  // Create box geometry based on style
  const boxGeometry = useMemo(() => {
    const { length, width, height, thickness } = dimensions
    
    switch (style) {
      case 'rsc':
        return createRSCGeometry(length, width, height, thickness)
      case 'autoBottom':
        return createAutoBottomGeometry(length, width, height, thickness)
      case 'display':
        return createDisplayBoxGeometry(length, width, height, thickness)
      case 'drawer':
        return createDrawerBoxGeometry(length, width, height, thickness)
      case 'folding':
        return createFoldingBoxGeometry(length, width, height, thickness)
      case 'gableTop':
        return createGableTopGeometry(length, width, height, thickness)
      case 'pillow':
        return createPillowBoxGeometry(length, width, height, thickness)
      case 'tuckEnd':
        return createTuckEndGeometry(length, width, height, thickness)
      case 'hingedLid':
        return createHingedLidGeometry(length, width, height, thickness)
      default:
        return createRSCGeometry(length, width, height, thickness)
    }
  }, [style, dimensions])

  // Material based on type
  const boxMaterial = useMemo(() => {
    const baseColor = color
    const materialProps = {
      corrugated: { 
        color: baseColor, 
        roughness: 0.8, 
        metalness: 0.1,
        normalScale: new THREE.Vector2(0.5, 0.5)
      },
      kraft: { 
        color: '#8B4513', 
        roughness: 0.9, 
        metalness: 0.05 
      },
      duplex: { 
        color: '#F5F5F5', 
        roughness: 0.3, 
        metalness: 0.2 
      },
      art: { 
        color: '#FFFFFF', 
        roughness: 0.2, 
        metalness: 0.3 
      }
    }

    return new THREE.MeshStandardMaterial(materialProps[material] || materialProps.corrugated)
  }, [material, color])

  // Folding animation
  useEffect(() => {
    if (groupRef.current && foldingState === 'folding') {
      setIsAnimating(true)
      animateFolding(groupRef.current, style, animationProgress)
        .then(() => {
          setIsAnimating(false)
          onFoldingComplete?.()
        })
        .catch((error) => {
          logger.error('Folding animation error:', error)
          setIsAnimating(false)
          onFoldingComplete?.()
        })
    }
  }, [foldingState, animationProgress, style, onFoldingComplete])

  return (
    <group ref={groupRef} {...props}>
      {/* Main box structure */}
      {boxGeometry.map((part, index) => (
        <mesh key={`${style}-${index}`} geometry={part.geometry} material={boxMaterial}>
          {part.position && <primitive object={part.position} attach="position" />}
          {part.rotation && <primitive object={part.rotation} attach="rotation" />}
        </mesh>
      ))}
      
      {/* Fold lines */}
      {showFoldLines && (
        <FoldLines 
          style={style} 
          dimensions={dimensions} 
          foldingState={foldingState}
        />
      )}
      
      {/* Assembly instructions overlay */}
      {foldingState === 'folding' && (
        <AssemblyInstructions 
          style={style} 
          step={Math.floor(animationProgress * BOX_STYLES[style].foldingSequence.length)}
        />
      )}
    </group>
  )
}

// Create RSC (Regular Slotted Container) geometry
function createRSCGeometry(length, width, height, thickness) {
  const parts = []
  
  // Bottom panel
  parts.push({
    geometry: new THREE.BoxGeometry(length, thickness, width),
    position: new THREE.Vector3(0, -height/2, 0),
    name: 'bottom'
  })
  
  // Top panel
  parts.push({
    geometry: new THREE.BoxGeometry(length, thickness, width),
    position: new THREE.Vector3(0, height/2, 0),
    name: 'top'
  })
  
  // Side panels
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, height, width),
    position: new THREE.Vector3(-length/2, 0, 0),
    name: 'left-side'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, height, width),
    position: new THREE.Vector3(length/2, 0, 0),
    name: 'right-side'
  })
  
  // Front and back panels
  parts.push({
    geometry: new THREE.BoxGeometry(length, height, thickness),
    position: new THREE.Vector3(0, 0, -width/2),
    name: 'front'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(length, height, thickness),
    position: new THREE.Vector3(0, 0, width/2),
    name: 'back'
  })
  
  // Flaps
  const flapLength = width * 0.6
  
  // Bottom flaps
  parts.push({
    geometry: new THREE.BoxGeometry(length, thickness, flapLength),
    position: new THREE.Vector3(0, -height/2 - thickness, -width/2 - flapLength/2),
    name: 'bottom-front-flap'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(length, thickness, flapLength),
    position: new THREE.Vector3(0, -height/2 - thickness, width/2 + flapLength/2),
    name: 'bottom-back-flap'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(flapLength, thickness, width),
    position: new THREE.Vector3(-length/2 - flapLength/2, -height/2 - thickness, 0),
    name: 'bottom-left-flap'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(flapLength, thickness, width),
    position: new THREE.Vector3(length/2 + flapLength/2, -height/2 - thickness, 0),
    name: 'bottom-right-flap'
  })
  
  // Top flaps (similar to bottom)
  parts.push({
    geometry: new THREE.BoxGeometry(length, thickness, flapLength),
    position: new THREE.Vector3(0, height/2 + thickness, -width/2 - flapLength/2),
    name: 'top-front-flap'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(length, thickness, flapLength),
    position: new THREE.Vector3(0, height/2 + thickness, width/2 + flapLength/2),
    name: 'top-back-flap'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(flapLength, thickness, width),
    position: new THREE.Vector3(-length/2 - flapLength/2, height/2 + thickness, 0),
    name: 'top-left-flap'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(flapLength, thickness, width),
    position: new THREE.Vector3(length/2 + flapLength/2, height/2 + thickness, 0),
    name: 'top-right-flap'
  })
  
  return parts
}

// Create Auto Bottom Box geometry
function createAutoBottomGeometry(length, width, height, thickness) {
  const parts = createRSCGeometry(length, width, height, thickness)
  
  // Add auto-lock tabs to bottom
  const tabWidth = width * 0.3
  const tabHeight = height * 0.2
  
  parts.push({
    geometry: new THREE.BoxGeometry(tabWidth, tabHeight, thickness),
    position: new THREE.Vector3(-length/4, -height/2 + tabHeight/2, -width/2),
    name: 'auto-lock-tab-1'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(tabWidth, tabHeight, thickness),
    position: new THREE.Vector3(length/4, -height/2 + tabHeight/2, -width/2),
    name: 'auto-lock-tab-2'
  })
  
  return parts
}

// Create Display Box geometry
function createDisplayBoxGeometry(length, width, height, thickness) {
  const parts = []
  
  // Base similar to RSC but with display panel
  const baseHeight = height * 0.6
  
  // Base panels
  parts.push({
    geometry: new THREE.BoxGeometry(length, thickness, width),
    position: new THREE.Vector3(0, -baseHeight/2, 0),
    name: 'bottom'
  })
  
  // Side panels (shorter for display)
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, baseHeight, width),
    position: new THREE.Vector3(-length/2, 0, 0),
    name: 'left-side'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, baseHeight, width),
    position: new THREE.Vector3(length/2, 0, 0),
    name: 'right-side'
  })
  
  // Front panel (lower)
  parts.push({
    geometry: new THREE.BoxGeometry(length, baseHeight, thickness),
    position: new THREE.Vector3(0, 0, -width/2),
    name: 'front'
  })
  
  // Display panel (angled back)
  const displayHeight = height * 0.4
  parts.push({
    geometry: new THREE.BoxGeometry(length, displayHeight, thickness),
    position: new THREE.Vector3(0, baseHeight/2 + displayHeight/4, width/2),
    rotation: new THREE.Euler(-Math.PI/6, 0, 0),
    name: 'display-panel'
  })
  
  return parts
}

// Drawer Box: Outer sleeve with inner drawer
function createDrawerBoxGeometry(length, width, height, thickness) {
  const parts = []
  const sleeveHeight = height * 0.95 // Sleeve slightly shorter
  
  // Outer sleeve (slightly larger)
  const sleeveThickness = thickness * 1.1
  parts.push({
    geometry: new THREE.BoxGeometry(length + sleeveThickness * 2, sleeveHeight, width + sleeveThickness * 2),
    position: new THREE.Vector3(0, 0, 0),
    name: 'outer-sleeve'
  })
  
  // Inner drawer (fits inside sleeve)
  parts.push({
    geometry: new THREE.BoxGeometry(length, height, width),
    position: new THREE.Vector3(0, -height * 0.025, 0),
    name: 'inner-drawer'
  })
  
  // Drawer pull tab
  const tabWidth = width * 0.3
  parts.push({
    geometry: new THREE.BoxGeometry(tabWidth, thickness * 2, thickness),
    position: new THREE.Vector3(0, height / 2 + thickness, width / 2 + thickness),
    name: 'drawer-tab'
  })
  
  return parts
}

// Folding Box: One-piece with foldable tabs
function createFoldingBoxGeometry(length, width, height, thickness) {
  const parts = createRSCGeometry(length, width, height, thickness)
  
  // Add foldable tabs on sides
  const tabSize = width * 0.15
  parts.push({
    geometry: new THREE.BoxGeometry(tabSize, height * 0.3, thickness),
    position: new THREE.Vector3(-length/2 - tabSize/2, -height/4, -width/2),
    name: 'fold-tab-1'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(tabSize, height * 0.3, thickness),
    position: new THREE.Vector3(length/2 + tabSize/2, -height/4, -width/2),
    name: 'fold-tab-2'
  })
  
  return parts
}

// Gable Top Box: Milk carton style with peaked top
function createGableTopGeometry(length, width, height, thickness) {
  const parts = []
  const baseHeight = height * 0.7
  const gableHeight = height * 0.3
  
  // Base (rectangular)
  parts.push({
    geometry: new THREE.BoxGeometry(length, baseHeight, width),
    position: new THREE.Vector3(0, -gableHeight/2, 0),
    name: 'base'
  })
  
  // Gable top (triangular peak)
  const gableShape = new THREE.Shape()
  gableShape.moveTo(-length/2, 0)
  gableShape.lineTo(0, gableHeight)
  gableShape.lineTo(length/2, 0)
  gableShape.lineTo(-length/2, 0)
  
  const gableGeometry = new THREE.ShapeGeometry(gableShape)
  parts.push({
    geometry: gableGeometry,
    position: new THREE.Vector3(0, baseHeight/2, 0),
    name: 'gable-top'
  })
  
  // Side panels
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, height, width),
    position: new THREE.Vector3(-length/2, 0, 0),
    name: 'left-side'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, height, width),
    position: new THREE.Vector3(length/2, 0, 0),
    name: 'right-side'
  })
  
  return parts
}

// Pillow Box: Curved pillow-shaped packaging
function createPillowBoxGeometry(length, width, height, thickness) {
  const parts = []
  
  // Main curved body using rounded box
  const curveRadius = Math.min(length, width) * 0.3
  parts.push({
    geometry: new THREE.BoxGeometry(length, height, width, 8, 8, 8),
    position: new THREE.Vector3(0, 0, 0),
    name: 'pillow-body'
  })
  
  // End caps (curved)
  const capGeometry = new THREE.CylinderGeometry(
    curveRadius,
    curveRadius,
    height,
    16
  )
  parts.push({
    geometry: capGeometry,
    position: new THREE.Vector3(-length/2, 0, 0),
    rotation: new THREE.Euler(0, 0, Math.PI/2),
    name: 'end-cap-1'
  })
  
  parts.push({
    geometry: capGeometry,
    position: new THREE.Vector3(length/2, 0, 0),
    rotation: new THREE.Euler(0, 0, Math.PI/2),
    name: 'end-cap-2'
  })
  
  return parts
}

// Tuck End Box: Boxes with tuck-in flaps on ends
function createTuckEndGeometry(length, width, height, thickness) {
  const parts = createRSCGeometry(length, width, height, thickness)
  
  // Modify flaps to be tuck-style (narrower, with notches)
  const tuckFlapWidth = width * 0.4
  
  // Replace bottom flaps with tuck flaps
  parts.forEach((part, index) => {
    if (part.name?.includes('bottom') && part.name?.includes('flap')) {
      parts[index] = {
        ...part,
        geometry: new THREE.BoxGeometry(tuckFlapWidth, thickness, thickness * 2),
        name: part.name?.replace('flap', 'tuck-flap')
      }
    }
  })
  
  return parts
}

// Hinged Lid Box: Premium box with attached hinged lid
function createHingedLidGeometry(length, width, height, thickness) {
  const parts = []
  const baseHeight = height * 0.6
  const lidHeight = height * 0.4
  
  // Base box
  parts.push({
    geometry: new THREE.BoxGeometry(length, baseHeight, width),
    position: new THREE.Vector3(0, -lidHeight/2, 0),
    name: 'base'
  })
  
  // Lid (attached with hinge)
  parts.push({
    geometry: new THREE.BoxGeometry(length, lidHeight, width),
    position: new THREE.Vector3(0, baseHeight/2 + lidHeight/2, 0),
    name: 'lid'
  })
  
  // Hinge (small connecting piece)
  const hingeWidth = length * 0.1
  parts.push({
    geometry: new THREE.BoxGeometry(hingeWidth, thickness, width),
    position: new THREE.Vector3(0, baseHeight/2, width/2 + thickness/2),
    name: 'hinge'
  })
  
  // Side panels
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, baseHeight, width),
    position: new THREE.Vector3(-length/2, -lidHeight/2, 0),
    name: 'left-side'
  })
  
  parts.push({
    geometry: new THREE.BoxGeometry(thickness, baseHeight, width),
    position: new THREE.Vector3(length/2, -lidHeight/2, 0),
    name: 'right-side'
  })
  
  return parts
}

// Fold lines component
function FoldLines({ style, dimensions, foldingState }) {
  const lines = useMemo(() => {
    const { length, width, height } = dimensions
    const foldLines = []
    
    // Add fold lines based on box style
    switch (style) {
      case 'rsc':
        // Vertical fold lines
        foldLines.push(
          { start: [-length/2, -height/2, -width/2], end: [-length/2, height/2, -width/2] },
          { start: [length/2, -height/2, -width/2], end: [length/2, height/2, -width/2] },
          { start: [-length/2, -height/2, width/2], end: [-length/2, height/2, width/2] },
          { start: [length/2, -height/2, width/2], end: [length/2, height/2, width/2] }
        )
        
        // Horizontal fold lines
        foldLines.push(
          { start: [-length/2, -height/2, -width/2], end: [length/2, -height/2, -width/2] },
          { start: [-length/2, height/2, -width/2], end: [length/2, height/2, -width/2] },
          { start: [-length/2, -height/2, width/2], end: [length/2, -height/2, width/2] },
          { start: [-length/2, height/2, width/2], end: [length/2, height/2, width/2] }
        )
        break
      // Add other styles...
    }
    
    return foldLines
  }, [style, dimensions])

  return (
    <group>
      {lines.map((line, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line.start, ...line.end])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#666666" linewidth={1} />
        </line>
      ))}
    </group>
  )
}

// Assembly instructions component
function AssemblyInstructions({ style, step }) {
  const instructions = BOX_STYLES[style]?.foldingSequence || []
  const currentInstruction = instructions[step] || 'Complete'

  return (
    <Html position={[0, 2, 0]} center>
      <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
        Step {step + 1}: {currentInstruction.replace('-', ' ').toUpperCase()}
      </div>
    </Html>
  )
}

// Folding animation function
async function animateFolding(group, style, progress) {
  const timeline = gsap.timeline()
  const foldingSequence = BOX_STYLES[style].foldingSequence
  
  // Animate based on folding sequence
  foldingSequence.forEach((step, index) => {
    const stepProgress = (progress * foldingSequence.length) - index
    if (stepProgress > 0 && stepProgress <= 1) {
      // Find parts related to this step and animate them
      const parts = group.children.filter(child => 
        child.userData.name && child.userData.name.includes(step)
      )
      
      parts.forEach(part => {
        timeline.to(part.rotation, {
          duration: 0.5,
          x: stepProgress * Math.PI/2,
          ease: "power2.inOut"
        }, index * 0.3)
      })
    }
  })
  
  return timeline.play()
}

// Main Enhanced 3D Configurator Component
export function Enhanced3DConfigurator({
  style = 'rsc',
  dimensions = { length: 30, width: 20, height: 15, thickness: 0.3 },
  material = 'corrugated',
  color = '#D4A574',
  foldingState = 'assembled',
  animationProgress = 0,
  showFoldLines = true,
  onFoldingComplete,
  className = ""
}) {
  const [cameraPosition, setCameraPosition] = useState([50, 30, 50])
  const [autoRotate, setAutoRotate] = useState(false)

  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        
        <Enhanced3DBox
          style={style}
          dimensions={dimensions}
          material={material}
          color={color}
          foldingState={foldingState}
          animationProgress={animationProgress}
          showFoldLines={showFoldLines}
          onFoldingComplete={onFoldingComplete}
          castShadow
          receiveShadow
        />
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={autoRotate}
          autoRotateSpeed={2}
          minDistance={20}
          maxDistance={200}
        />
        
        <Environment preset="studio" />
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -20, 0]} receiveShadow>
          <planeGeometry args={[200, 200]} />
          <shadowMaterial opacity={0.2} />
        </mesh>
      </Canvas>
    </div>
  )
}

export default Enhanced3DConfigurator
