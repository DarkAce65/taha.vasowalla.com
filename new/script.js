window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };

document.addEventListener('DOMContentLoaded', function (e) {
    function displaceSatelliteGeometry(satelliteGeometry) {
        for (let i = 0; i < satelliteGeometry.vertices.length; i++) {
            const v = satelliteGeometry.vertices[i].clone().setLength(0.4);
            satelliteGeometry.vertices[i].setLength(3 + Math.abs(simplex.noise3D(v.x, v.y, v.z)) * 2);
        }
    }

    function setCamera() {
        let f = 1;
        if (window.innerWidth < 500) {
            f = 2;
        }
        else if (window.innerWidth < 1000) {
            f = 1.4;
        }

        camera.position.set(50 * f, -300 * f, 100 * f);
        camera.lookAt(scene.position);
    }

    const simplex = new SimplexNoise();

    const clock = new THREE.Clock();
    window.scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    document.querySelector('#rendererContainer').appendChild(renderer.domElement);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    window.camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 10000);
    setCamera();

    const lights = [];

    lights[0] = new THREE.PointLight(0xeeeefe, 2, 300, 1.5);
    lights[0].position.set(45, 15, 105);

    lights[1] = new THREE.PointLight(0x423e6a, 1, 1200, 2);
    lights[1].position.set(-90, 10, 120);

    lights[2] = new THREE.PointLight(0x513c1f, 1, 300, 3);
    lights[2].position.set(40, -40, 80);

    for (let i = 0; i < lights.length; i++) {
        scene.add(lights[i]);
    }

    const planetMaterial = new THREE.MeshPhongMaterial({
        shininess: 30,
        color: 0x526464,
        side: THREE.DoubleSide,
        flatShading: true
    });
    window.planetMaterial = planetMaterial;
    const planetGeometry = new THREE.IcosahedronGeometry(50, 3);
    for (let i = 0; i < planetGeometry.vertices.length; i++) {
        planetGeometry.vertices[i].x += Math.random() * 6 - 3;
        planetGeometry.vertices[i].y += Math.random() * 6 - 3;
        if (Math.random() < 0.1) {
            planetGeometry.vertices[i].setLength(45 + Math.random() * 10);
        }
        else {
            planetGeometry.vertices[i].setLength(49 + Math.random() * 2);
        }
    }
    for (let i = 0; i < 50; i++) {
        planetGeometry.faces[i].materialIndex = 1;
    }
    const planet = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(planetGeometry), planetMaterial);
    scene.add(planet);

    let satelliteScale = Math.min(window.innerWidth, window.innerHeight) < 500 ? 2 : 1;
    const satellites = [];
    const satelliteMaterial = new THREE.MeshPhongMaterial({
        shininess: 30,
        color: 0x526464,
        side: THREE.DoubleSide,
        flatShading: true
    });
    for (let i = 0; i < 100; i++) {
        const radius = i === 50 ? 1 : Math.max(1, Math.pow(Math.random() + 0.2, 2) * 2.5);
        const detail = radius > 2.5 ? 1 : 0;
        const satelliteGeometry = new THREE.IcosahedronGeometry(radius, detail);
        if (radius > 2.5) {
            displaceSatelliteGeometry(satelliteGeometry);
        }
        const positionR = 80 + Math.random() * 30;
        const c = positionR * Math.cos(i * Math.PI / 50);
        const s = positionR * Math.sin(i * Math.PI / 50);
        const h = Math.random() * 30 - 15;
        satelliteGeometry.applyMatrix(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(Math.random(), Math.random(), Math.random(), 'XYZ')));
        const satellite = new THREE.Mesh(new THREE.BufferGeometry().fromGeometry(satelliteGeometry), i === 50 ? new THREE.MeshPhongMaterial({
            shininess: 30,
            color: 0x526464,
            emissive: 0xe53319,
            side: THREE.DoubleSide,
            flatShading: true
        }) : satelliteMaterial);
        satellite.position.set(c, s, h);

        satellite.orbitSpeed = 0.08 / radius;
        if(i === 50) {
            satellite.orbitSpeed *= 3;
            satellite.add(new THREE.PointLight(0xe53319, 1, 100, 2));
        }
        scene.add(satellite);
        satellites.push(satellite);
    }

    function render() {
        requestAnimFrame(render);
        renderer.render(scene, camera);

        const delta = clock.getDelta();
        planet.rotation.z += delta / 25;
        for (let i = 0; i < satellites.length; i++) {
            satellites[i].position.applyAxisAngle(new THREE.Vector3(0, 0, 1), satellites[i].orbitSpeed * delta);
        }
    }

    render();

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        setCamera();

        const newScale = Math.min(window.innerWidth, window.innerHeight) < 500 ? 2 : 1;
        if (satelliteScale !== newScale) {
            satelliteScale = newScale;
            satellites.forEach(function (satellite) {
                satellite.scale.setScalar(newScale);
            });
        }
    });

    let activeMenuEl = null;
    document.querySelectorAll('#primary .menu-item span').forEach(el => {
        el.addEventListener('click', function (e) {
            if (activeMenuEl !== null && activeMenuEl.dataset.menu === this.dataset.menu) {
                activeMenuEl.classList.remove('active');
                document.querySelector('#secondary').classList.add('closed');
                document.querySelectorAll('.submenu.active').forEach(el => el.classList.remove('active'));
                activeMenuEl = null;
                return;
            }

            if (activeMenuEl === null) {
                document.querySelector('#secondary').classList.remove('closed');
            }
            else {
                activeMenuEl.classList.remove('active');
                document.querySelector(activeMenuEl.dataset.menu).classList.remove('active');
            }
            activeMenuEl = this;
            activeMenuEl.classList.add('active');
            document.querySelector(activeMenuEl.dataset.menu).classList.add('active');
        });
    });
});
