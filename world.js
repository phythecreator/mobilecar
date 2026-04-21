import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.initSky();
        this.initLights();
    }

    initSky() {
        // Céu Realista Azul
        this.scene.background = new THREE.Color(0x4488ff);
        this.scene.fog = new THREE.Fog(0x4488ff, 100, 5000);
    }

    initLights() {
        const sun = new THREE.DirectionalLight(0xffffff, 2);
        sun.position.set(100, 500, 100);
        sun.castShadow = true;
        sun.shadow.mapSize.set(4096, 4096); // Sombras ultra HD
        this.scene.add(sun);
        
        const amb = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(amb);
    }

    setupTrack(model) {
        model.scale.set(10, 10, 10);
        model.traverse(n => { if(n.isMesh) n.receiveShadow = true; });
        this.scene.add(model);
    }

    createPlaceholder() {
        const grid = new THREE.GridHelper(1000, 50, 0xff0044, 0x444444);
        this.scene.add(grid);
        
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshStandardMaterial({ color: 0x111111 })
        );
        plane.rotation.x = -Math.PI/2;
        plane.receiveShadow = true;
        this.scene.add(plane);
    }
}
