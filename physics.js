import * as THREE from 'three';

export class Vehicle {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.speed = 0;
        this.rpm = 800;
        this.gear = 1;
        this.steering = 0;
        this.velocity = new THREE.Vector3();
    }

    setupModel(model) {
        this.mesh.add(model);
        model.traverse(n => { if(n.isMesh) n.castShadow = n.receiveShadow = true; });
        this.scene.add(this.mesh);
    }

    createPlaceholder() {
        const geo = new THREE.BoxGeometry(2, 0.5, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0xff0044 });
        this.mesh.add(new THREE.Mesh(geo, mat));
        this.scene.add(this.mesh);
    }

    update(keys, dt) {
        // Aceleração com curva de torque
        if (keys['KeyW']) {
            this.speed += 0.2;
            this.rpm = THREE.MathUtils.lerp(this.rpm, 7500, 0.05);
        } else {
            this.speed *= 0.98;
            this.rpm = THREE.MathUtils.lerp(this.rpm, 900, 0.02);
        }

        // Simulação de mudanças
        this.gear = Math.max(1, Math.ceil(this.speed / 20));

        // Direção suave
        const targetSteer = keys['KeyA'] ? 0.04 : keys['KeyD'] ? -0.04 : 0;
        this.steering = THREE.MathUtils.lerp(this.steering, targetSteer, 0.1);

        if (Math.abs(this.speed) > 0.1) {
            this.mesh.rotation.y += this.steering * (this.speed * 0.05);
        }

        const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.mesh.quaternion);
        this.mesh.position.addScaledVector(dir, this.speed * dt);
    }
}
