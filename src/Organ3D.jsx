import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Wireframe } from '@react-three/drei';
import * as THREE from 'three';

function ModelMesh({ organ, isGenerating }) {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            if (isGenerating) {
                meshRef.current.rotation.y += 0.05;
                meshRef.current.rotation.x += 0.02;
                const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
                meshRef.current.scale.set(scale, scale, scale);
            } else {
                meshRef.current.rotation.y += 0.005;
                meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
    });

    let geometry;
    let color = '#00d2d3'; // teal

    // Create rough, procedurally modified shapes for each organ
    if (organ === 'Heart Scaffold') {
        const heartGroup = new THREE.Group();

        // --- 1. Main Cardiac Body (Glassy/Opaque mix) ---
        // We use a Lathe or a more complex deformed Sphere for the main bulk
        const bodyGeom = new THREE.SphereGeometry(1.5, 64, 64);
        const pos = bodyGeom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            // Anatomical heart deformation based on the reference:
            // Pointed apex shifted slightly to one side
            if (y < 0) {
                const taper = Math.pow(1 + y * 0.6, 1.2);
                x *= (taper + 0.1);
                z *= taper;
            } else {
                // Wide, dual-lobed base
                const baseWidth = 1 + y * 0.4;
                x *= baseWidth;
                z *= (baseWidth * 0.8);
                // The "cleft" indentation at the top
                const cleft = 1 - Math.exp(-Math.abs(x) * 3) * 0.3 * y;
                y *= cleft;
            }

            // Bulge for the right ventricle (asymmetry)
            if (x < -0.2) x *= 1.3;
            // General bulkiness
            z *= 1.1;

            pos.setX(i, x);
            pos.setY(i, y * 1.6);
            pos.setZ(i, z * 0.9);
        }
        bodyGeom.computeVertexNormals();

        // Material matching the reference: Semi-translucent with internal glow
        const bodyMat = new THREE.MeshPhysicalMaterial({
            color: '#f9dada',
            metalness: 0.0,
            roughness: 0.1,
            transmission: 0.9, // High transparency
            thickness: 1.0,
            transparent: true,
            opacity: 0.6,
            emissive: '#ff6666',
            emissiveIntensity: 0.1,
            side: THREE.DoubleSide,
            clearcoat: 1.0
        });
        const mainBody = new THREE.Mesh(bodyGeom, bodyMat);
        heartGroup.add(mainBody);

        // --- 2. Internal Core (The glowing red veins/chambers) ---
        const innerGeom = new THREE.SphereGeometry(1.2, 32, 32);
        const innerPos = innerGeom.attributes.position;
        for (let i = 0; i < innerPos.count; i++) {
            innerPos.setY(i, innerPos.getY(i) * 1.5);
            innerPos.setX(i, innerPos.getX(i) * 0.8);
        }
        const innerMat = new THREE.MeshStandardMaterial({
            color: '#ff2222',
            emissive: '#ff0000',
            emissiveIntensity: 2.5,
            transparent: true,
            opacity: 0.8
        });
        const innerCore = new THREE.Mesh(innerGeom, innerMat);
        innerCore.scale.set(0.7, 0.8, 0.7);
        innerCore.position.y = -0.2;
        heartGroup.add(innerCore);

        // --- 3. The Aortic Arch (Dominant vessel in the reference) ---
        const aortaCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.5, 0),
            new THREE.Vector3(-0.2, 2.0, 0),
            new THREE.Vector3(-0.8, 2.8, 0),
            new THREE.Vector3(-1.8, 2.2, 0),
            new THREE.Vector3(-1.8, 0.5, 0)
        ]);
        const aortaGeom = new THREE.TubeGeometry(aortaCurve, 64, 0.3, 20, false);
        const vesselMat = new THREE.MeshPhysicalMaterial({
            color: '#ffffff',
            transmission: 0.9,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            thickness: 0.5
        });
        const aorta = new THREE.Mesh(aortaGeom, vesselMat);
        aorta.position.set(0.2, 0, 0.2);
        heartGroup.add(aorta);

        // Three distinct vessels branching off the top of the arch
        for (let i = 0; i < 3; i++) {
            const branchGeom = new THREE.CylinderGeometry(0.08, 0.12, 0.8, 16);
            const branch = new THREE.Mesh(branchGeom, vesselMat);
            branch.position.set(-0.6 - (i * 0.4), 3.0, 0);
            branch.rotation.z = 0.1;
            heartGroup.add(branch);
        }

        // --- 4. Pulmonary Trunk (The T-shaped vessel) ---
        const pulmonaryBase = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.2, 20), vesselMat);
        pulmonaryBase.position.set(0.6, 1.8, 0.6);
        pulmonaryBase.rotation.z = -0.4;
        heartGroup.add(pulmonaryBase);

        const pulmonaryLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.8, 16), vesselMat);
        pulmonaryLeft.position.set(1.0, 2.2, 0.8);
        pulmonaryLeft.rotation.z = -1.2;
        heartGroup.add(pulmonaryLeft);

        return (
            <primitive
                object={heartGroup}
                ref={meshRef}
            />
        );
    } else if (organ === 'Liver') {
        // Liver: Characteristic wedge shape with two lobes
        geometry = new THREE.SphereGeometry(1.6, 32, 32);
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            // Flatten top to bottom (superior-inferior)
            y *= 0.7;
            // Elongate horizontally (right-left) 
            x *= 1.8;
            // Taper the left side (x < 0) more than the right
            if (x < 0) {
                const taperLeft = 1 + (x / 2) * 0.5;
                y *= taperLeft;
                z *= taperLeft;
            }
            // Wedge effect: thicker on one side
            z *= (1 + x * 0.15);

            pos.setX(i, x);
            pos.setY(i, y);
            pos.setZ(i, z);
        }
        geometry.computeVertexNormals();
        color = '#10ac84'; // medical green
    } else {
        // Kidney
        geometry = new THREE.SphereGeometry(1.2, 32, 32);
        const pos = geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let x = pos.getX(i);
            let y = pos.getY(i);
            let z = pos.getZ(i);

            // Elongate vertically
            y *= 1.6;

            // Flatten slightly on Z
            z *= 0.8;

            // Create the bean curvature (the hilum indent)
            // If x is positive (the inner curve), push it inward
            if (x > 0) {
                // The indent is strongest near the center (y=0) and fades out towards the poles
                const indentAmount = Math.cos(y * 0.8) * 0.7;
                x -= Math.max(0, indentAmount);
            } else {
                // Slightly bulge the outer curve
                x -= 0.2;
            }

            pos.setX(i, x);
            pos.setY(i, y);
            pos.setZ(i, z);
        }
        geometry.computeVertexNormals();
        color = '#00a8ff'; // cyan
    }

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <meshStandardMaterial
                color={color}
                wireframe={true}
                transparent={true}
                opacity={0.6}
                emissive={color}
                emissiveIntensity={0.5}
            />
        </mesh>
    );
}

export default function Organ3D({ organ, isGenerating }) {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10 }}>
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#00d2d3" />

                <ModelMesh organ={organ} isGenerating={isGenerating} />
                <OrbitControls enableZoom={true} enablePan={false} autoRotate={!isGenerating} autoRotateSpeed={1.0} />
            </Canvas>
        </div>
    );
}
