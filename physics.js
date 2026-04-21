import * as THREE from 'three';

export class Vehicle {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        
        // Chassis (Centro de Massa)
        this.chassis = new THREE.Group();
        this.createModel();
        this.scene.add(this.chassis);

        // Estado Físico
        this.velocity = new THREE.Vector3();
        this.angularVelocity = new THREE.Vector3();
        this.quaternion = new THREE.Quaternion();
        this.rpm = 800;
        this.gear = 1;
        this.steering = 0;
        
        // Constantes do Carro
        this.mass = 1200;
        this.suspensionStiffness = 40.0;
        this.suspensionDamping = 2.5;
        this.suspensionRestLength = 0.5;
        this.engineForce = 0;
        this.brakingForce = 0;

        // Rodas (FL, FR, RL, RR)
        this.wheels = [
            { pos: new THREE.Vector3(0.8, 0, 1.2), suspensionLength: 0.5, grounded: false },
            { pos: new THREE.Vector3(-0.8, 0, 1.2), suspensionLength: 0.5, grounded: false },
            { pos: new THREE.Vector3(0.8, 0, -1.2), suspensionLength: 0.5, grounded: false },
            { pos: new THREE.Vector3(-0.8, 0, -1.2), suspensionLength: 0.5, grounded: false }
        ];
    }

    createModel() {
        const bodyGeom = new THREE.BoxGeometry(1.8, 0.6, 4);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.8, roughness: 0.2 });
        const mesh = new THREE.Mesh(bodyGeom, bodyMat);
        mesh.castShadow = true;
        this.chassis.add(mesh);
        
        // Cockpit
        const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.5), bodyMat);
        cockpit.position.y = 0.5;
        cockpit.position.z = -0.2;
        this.chassis.add(cockpit);
    }

    update(keys, dt) {
        // Direção
        const targetSteer = keys['KeyA'] ? 0.5 : keys['KeyD'] ? -0.5 : 0;
        this.steering = THREE.MathUtils.lerp(this.steering, targetSteer, 0.1);

        // Motor & Transmissão
        if (keys['KeyW']) {
            this.engineForce = 8000;
            this.rpm = THREE.MathUtils.lerp(this.rpm, 7500, 0.05);
        } else {
            this.engineForce = 0;
            this.rpm = THREE.MathUtils.lerp(this.rpm, 800, 0.02);
        }
        
        this.brakingForce = keys['Space'] ? 15000 : 0;

        // Aplicação de Forças (Simplificação de Vetores)
        const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(this.chassis.quaternion);
        const side = new THREE.Vector3(1, 0, 0).applyQuaternion(this.chassis.quaternion);

        // Aceleração Baseada em Massa
        const accel = (this.engineForce / this.mass) * dt;
        this.velocity.addScaledVector(forward, accel);
        
        // Atrito e Drag Aerodinâmico
        this.velocity.multiplyScalar(0.99); 
        
        // Rotação baseada na velocidade (Yaw)
        const speedScale = this.velocity.dot(forward);
        if(Math.abs(speedScale) > 0.1) {
            this.chassis.rotation.y += this.steering * speedScale * 0.02;
        }

        // Aplicar posição
        this.chassis.position.add(this.velocity);

        // Simulação de "Suspensão" Visual (Pitch/Roll)
        this.chassis.rotation.x = THREE.MathUtils.lerp(this.chassis.rotation.x, -accel * 2, 0.1);
        this.chassis.rotation.z = THREE.MathUtils.lerp(this.chassis.rotation.z, this.steering * 0.1, 0.1);
    }
}
