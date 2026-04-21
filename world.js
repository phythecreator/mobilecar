import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.init();
    }

    init() {
        // Céu HDR (Gradiente)
        const skyColor = new THREE.Color(0x223344);
        this.scene.background = skyColor;
        this.scene.fog = new THREE.Fog(0x223344, 50, 1000);

        // Luzes
        const sun = new THREE.DirectionalLight(0xffffff, 1.5);
        sun.position.set(100, 200, 100);
        sun.castShadow = true;
        sun.shadow.camera.left = -100;
        sun.shadow.camera.right = 100;
        sun.shadow.camera.top = 100;
        sun.shadow.camera.bottom = -100;
        sun.shadow.mapSize.set(2048, 2048);
        this.scene.add(sun);
        this.scene.add(new THREE.AmbientLight(0x404040, 0.5));

        this.createTrack();
    }

    createTrack() {
        // Pista Profissional com Curvas Matemáticas
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(100, 0, 50),
            new THREE.Vector3(250, 0, 0),
            new THREE.Vector3(400, 0, 150),
            new THREE.Vector3(300, 0, 400),
            new THREE.Vector3(0, 0, 300),
            new THREE.Vector3(-100, 0, 100)
        ], true);

        const points = curve.getPoints(200);
        const geometry = new THREE.TubeGeometry(curve, 200, 12, 20, true);
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a1a, 
            roughness: 0.8, 
            metalness: 0.1 
        });
        
        const track = new THREE.Mesh(geometry, material);
        track.scale.y = 0.02; // Achatar o tubo para virar estrada
        track.receiveShadow = true;
        this.scene.add(track);

        // Zebras (Red/White)
        this.addDetails(curve);
    }

    addDetails(curve) {
        const samples = 400;
        for(let i = 0; i < samples; i++) {
            if(i % 2 === 0) {
                const pos = curve.getPoint(i / samples);
                const zebraGeom = new THREE.BoxGeometry(15, 0.2, 2);
                const zebraMat = new THREE.MeshStandardMaterial({ 
                    color: (i % 4 === 0) ? 0xffffff : 0xff0000 
                });
                const zebra = new THREE.Mesh(zebraGeom, zebraMat);
                zebra.position.copy(pos);
                zebra.position.y = -0.1;
                zebra.lookAt(curve.getPoint((i+1)/samples));
                this.scene.add(zebra);
            }
        }
    }
}
