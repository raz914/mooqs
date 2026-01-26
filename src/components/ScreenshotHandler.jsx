import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

const ScreenshotHandler = ({ onRegister }) => {
    const { gl, scene, camera, size } = useThree();

    useEffect(() => {
        if (onRegister) {
            onRegister({
                capture: () => {
                    console.log("📸 Capture function invoked");
                    try {
                        // 1. Save current camera state
                        console.log("📸 Saving camera state");
                        const originalPosition = camera.position.clone();
                        const originalRotation = camera.rotation.clone();
                        const originalZoom = camera.zoom;

                        // 2. Set camera for top-down view
                        // Assuming 0,0,0 is center of tray. Adjust Y height as needed to fit.
                        // Using a high Y value and looking at origin.
                        camera.position.set(0, 50, 0);
                        camera.lookAt(0, 0, 0);
                        camera.updateProjectionMatrix();

                        // 3. Render the scene
                        console.log("📸 Rendering scene");
                        gl.render(scene, camera);

                        // 4. Capture screenshot
                        console.log("📸 Generating Data URL");
                        const dataUrl = gl.domElement.toDataURL('image/png');
                        console.log("📸 Data URL generated, length:", dataUrl.length);

                        // 5. Restore camera state
                        camera.position.copy(originalPosition);
                        camera.rotation.copy(originalRotation);
                        camera.zoom = originalZoom;
                        camera.updateProjectionMatrix();

                        // Re-render to restore view immediately (optional but good for UX)
                        // gl.render(scene, camera); // OrbitControls usually handles next frame update

                        // 6. Trigger download
                        console.log("📸 Creating download link");
                        const link = document.createElement('a');
                        link.setAttribute('download', 'tray_quote.png');
                        link.setAttribute('href', dataUrl);
                        document.body.appendChild(link); // Append to body to ensure click works
                        link.click();
                        document.body.removeChild(link);
                        console.log("📸 Download triggered");
                    } catch (e) {
                        console.error("📸 Error taking screenshot:", e);
                    }
                }
            });
        }
    }, [gl, scene, camera, onRegister]);

    return null;
};

export default ScreenshotHandler;
