import React, { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber'
import { useTexture, Text, Center, Environment } from '@react-three/drei'
import { Physics, RigidBody, useRopeJoint, useSphericalJoint, BallCollider, CuboidCollider } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'
import * as THREE from 'three'

extend({ MeshLineGeometry, MeshLineMaterial })

function Band() {
  const band = useRef(), fixed = useRef(), j1 = useRef(), j2 = useRef(), j3 = useRef(), card = useRef()
  const vec = new THREE.Vector3(), dir = new THREE.Vector3()
  
  const cardTexture = useLoader(THREE.TextureLoader, '/pics/sam.jpeg')
  const strapTexture = useTexture('/pics/lanyard.jpeg') 
  
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]))
  const [dragged, drag] = useState(false)

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.9])
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.9])
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.9])
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1, 0]])

  useFrame((state) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
      dir.copy(vec).sub(state.camera.position).normalize()
      vec.add(dir.multiplyScalar(state.camera.position.length()))
      card.current?.setNextKinematicTranslation({ x: vec.x, y: vec.y, z: vec.z })
    }

    if (fixed.current && band.current) {
      curve.points[0].copy(j3.current.translation())
      curve.points[1].copy(j2.current.translation())
      curve.points[2].copy(j1.current.translation())
      curve.points[3].copy(fixed.current.translation())
      band.current.geometry.setPoints(curve.getPoints(32))
    }
  })

  strapTexture.wrapS = strapTexture.wrapT = THREE.RepeatWrapping

  return (
    <>
      <group position={[-6, 6, 0]}> 
        <RigidBody ref={fixed} type="fixed" />
        <RigidBody position={[0, -0.9, 0]} ref={j1} type="dynamic" colliders={false} linearDamping={4} angularDamping={4}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -1.8, 0]} ref={j2} type="dynamic" colliders={false} linearDamping={4} angularDamping={4}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0, -2.7, 0]} ref={j3} type="dynamic" colliders={false} linearDamping={4} angularDamping={4}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        
        <RigidBody 
          ref={card} 
          position={[0, -6.0, 0]}
          type={dragged ? 'kinematicPosition' : 'dynamic'} 
          colliders={false}
          angularDamping={5}
          linearDamping={5}
        >
          <CuboidCollider args={[1.6, 2.3, 0.05]} /> 
          <group 
            onPointerDown={(e) => {
              e.stopPropagation()
              drag(true)
            }} 
            onPointerUp={(e) => {
              e.stopPropagation()
              drag(false)
            }}
          >
            <mesh>
              <boxGeometry args={[3.2, 4.6, 0.15]} /> 
              <meshStandardMaterial color="#0f0f1e" metalness={0.6} roughness={0.4} />
            </mesh>

            <mesh position={[0, 0, 0.08]}>
              <planeGeometry args={[3.15, 4.55]} />
              <meshBasicMaterial color="#1a1a2e" />
            </mesh>
              
            <group position={[0, 0, 0.09]}> 
              <mesh position={[0, 1.85, 0]}>
                <planeGeometry args={[3.1, 0.35]} />
                <meshBasicMaterial color="#16213e" />
              </mesh>
              
              <Center position={[0, 1.75, 0.01]}>
                <Text fontSize={0.12} color="#818cf8" bold anchorX="center" anchorY="middle">
                  WMSU ID
                </Text>
              </Center>

              <mesh position={[0, 0.65, 0]}>
                <planeGeometry args={[2.8, 1.8]} />
                <meshBasicMaterial map={cardTexture} />
              </mesh>
              
              <mesh position={[0, 0.2, 0]}>
                <planeGeometry args={[3.0, 0.02]} />
                <meshBasicMaterial color="#4f46e5" />
              </mesh>
              
              <Center position={[0, -0.45, 0]}>
                <Text fontSize={0.13} color="white" bold anchorX="center" anchorY="middle" maxWidth={2.8}>
                  SITTIMAE T. MUHADALAM
                </Text>
              </Center>
              
              <Center position={[0, -0.88, 0]}>
                <Text fontSize={0.09} color="#818cf8" anchorX="center" anchorY="middle" maxWidth={2.8}>
                  System Analyst
                </Text>
              </Center>
              
              <Center position={[0, -1.3, 0]}>
                <Text fontSize={0.068} color="#cbd5e1" anchorX="center" anchorY="middle" maxWidth={2.8} letterSpacing={-0.02}>
                  Western Mindanao State University
                </Text>
              </Center>

              <mesh position={[0, -1.8, 0]}>
                <planeGeometry args={[3.1, 0.25]} />
                <meshBasicMaterial color="#16213e" />
              </mesh>
            </group>
          </group>
        </RigidBody>
      </group>

      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial 
          useMap={1} 
          map={strapTexture}
          repeat={[-4, 1]} 
          lineWidth={0.25} 
          transparent
        />
      </mesh>
    </>
  )
}

export default function Lanyard({ isVisible = true }) {
  const [shouldRender, setShouldRender] = useState(isVisible)

  useEffect(() => {
    const handleScroll = () => {
      // Hide lanyard when scrolled past intro (adjust value based on your intro height)
      const introHeight = window.innerHeight * 1.2 // Adjust multiplier as needed
      setShouldRender(window.scrollY < introHeight)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!shouldRender) return null

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      zIndex: 10,
      pointerEvents: 'auto'
    }}>
      <Canvas 
        camera={{ position: [0, 0, 22], fov: 30 }} 
        gl={{ alpha: true }}
        style={{ 
          pointerEvents: 'auto'
        }}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2.5} />
        <Suspense fallback={null}>
          <Physics gravity={[0, -20, 0]}> 
            <Band />
          </Physics>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}