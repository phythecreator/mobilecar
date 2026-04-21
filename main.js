import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Vehicle } from './physics.js';
import { World } from './world.js';

class MobileCarPro {
    constructor() {
        this.container = document.body;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
        
        this.initGraphics();
        this.world = new World(this.scene);
        this.vehicle = new Vehicle(this.scene);
        
        this.loaded = false;
        this.isRacing = false;
        this.loadModels();
        this.bindEvents();
    }

    initGraphics() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }

    async loadModels() {
        const loader = new GLTFLoader();
        
        // Carregar Carro e Pista
        try {
            // Nota: Altera para os nomes reais dos teus ficheiros extraídos
            const [carData, trackData] = await Promise.all([
                loader.loadAsync('./carro.glb'), 
                loader.loadAsync('./pista.glb')
            ]);

            this.vehicle.setupModel(carData.scene);
            this.world.setupTrack(trackData.scene);
            
            this.loaded = true;
            console.log("Modelos carregados!");
        } catch (e) {
            console.error("Erro ao carregar modelos. Usando placeholders.", e);
            this.vehicle.createPlaceholder();
            this.world.createPlaceholder();
        }
    }

    bindEvents() {
        document.getElementById('start-btn').onclick = () => {
            document.getElementById('overlay').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('overlay').style.display = 'none';
                document.getElementById('hud').style.display = 'block';
                this.isRacing = true;
            }, 800);
        };

        this.keys = {};
        window.onkeydown = (e) => this.keys[e.code] = true;
        window.onkeyup = (e) => this.keys[e.code] = false;
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (!this.isRacing) return;

        const dt = 1/60;
        this.vehicle.update(this.keys, dt);
        this.updateCamera();
        this.updateHUD();
        
        this.renderer.render(this.scene, this.camera);
    }

    updateCamera() {
        const relativeCameraOffset = new THREE.Vector3(0, 2.5, -7);
        const cameraOffset = relativeCameraOffset.applyMatrix4(this.vehicle.mesh.matrixWorld);
        this.camera.position.lerp(cameraOffset, 0.1);
        this.camera.lookAt(this.vehicle.mesh.position);
    }

    updateHUD() {
        const speed = Math.floor(this.vehicle.speed * 3.6);
        document.getElementById('speed-val').innerText = speed;
        document.getElementById('rpm-fill').style.width = `${(this.vehicle.rpm / 8000) * 100}%`;
        document.getElementById('gear-val').innerText = this.vehicle.gear;
    }
}

const game = new MobileCarPro();
game.animate();
