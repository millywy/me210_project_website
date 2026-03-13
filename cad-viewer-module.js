// Update for proper GLB color display
function updateGLBMaterials(gltf) {
    gltf.scene.traverse((node) => {
        if (node.isMesh) {
            // Preserve and enhance material properties
            node.material = new THREE.MeshStandardMaterial({
                color: node.material.color,
                roughness: node.material.roughness,
                metalness: node.material.metalness,
                // Other properties to enhance as needed
            });
        }
    });
}