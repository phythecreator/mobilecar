import * as THREE from 'three';
import { Vehicle } from './physics.js';
import { World } from './world.js';

class Core {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        document.body.appendChild(this.renderer.domElement);

        this.world = new World(this.scene);
        this.vehicle = new Vehicle(this.scene, this.world);
        
        this.keys = {};
        this.setupInputs();
        this.animate();
    }

    setupInputs() {
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    updateCamera() {
        const targetPos = this.vehicle.chassis.position.clone();
        const offset = new THREE.Vector3(0, 2.5, -6).applyQuaternion(this.vehicle.chassis.quaternion);
        this.camera.position.lerp(targetPos.add(offset), 0.15);
        this.camera.lookAt(this.vehicle.chassis.position.clone().add(new THREE.Vector3(0, 1, 0)));
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        const dt = 1/60;
        this.vehicle.update(this.keys, dt);
        this.updateCamera();
        this.updateHUD();
        
        this.renderer.render(this.scene, this.camera);
    }

    updateHUD() {
        const speed = Math.abs(this.vehicle.velocity.length() * 3.6);
        document.getElementById('speed').innerHTML = `${Math.floor(speed)} <span>KM/H</span>`;
        document.getElementById('rpm-fill').style.width = `${(this.vehicle.rpm / 8000) * 100}%`;
        document.getElementById('gear').innerText = this.vehicle.gear === 0 ? 'R' : this.vehicle.gear;
    }
}

new Core();
