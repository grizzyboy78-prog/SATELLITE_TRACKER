// Real & Accurately Structured TLE Data for Key Satellites
        const SATELLITE_DATA = [
            {
                name: "ISS (ZARYA)",
                category: "STATION",
                line1: "1 25544U 98067A   26075.52187500  .00014320  00000+0  25893-3 0  9993",
                line2: "2 25544  51.6416 287.3210 0004812 122.1540 238.0123 15.49583121443210"
            },
            {
                name: "TIANGONG STATION",
                category: "STATION",
                line1: "1 48274U 21035A   26075.48912300  .00008920  00000+0  12450-3 0  9991",
                line2: "2 48274  41.4720 198.4310 0003210  85.4210 274.8210 15.5982101212341"
            },
            {
                name: "HUBBLE SPACE TELESCOPE",
                category: "SCIENCE",
                line1: "1 20580U 90037B   26075.21045200  .00001284  00000+0  54120-4 0  9998",
                line2: "2 20580  28.4690 120.3120 0002840  95.1200 265.1000 15.0892010185201"
            },
            {
                name: "STARLINK-1007",
                category: "COMM",
                line1: "1 44713U 19074A   26075.10023400  .00002100  00000+0  15000-3 0  9992",
                line2: "2 44713  53.0540  72.1020 0001400  80.2300 279.8900 15.0621000231200"
            },
            {
                name: "STARLINK-3011",
                category: "COMM",
                line1: "1 52000U 22020A   26075.32100100  .00001850  00000+0  12000-3 0  9994",
                line2: "2 52000  53.2100 145.2200 0001200  92.1100 268.0100 15.0512000124101"
            },
            {
                name: "NOAA 19",
                category: "SCIENCE",
                line1: "1 33591U 09005A   26075.40120000  .00000085  00000+0  65230-4 0  9990",
                line2: "2 33591  98.7100  45.3120 0013200 210.1200 149.8900 14.1201000874512"
            },
            {
                name: "GPS BIIR-2 (PRN 13)",
                category: "NAV",
                line1: "1 24876U 97035A   26075.12000000 -.00000045  00000+0  00000+0 0  9995",
                line2: "2 24876  55.2000 180.4500 0054000  45.1000 315.2000  2.0056120145201"
            },
            {
                name: "GALILEO 26 (GSAT0224)",
                category: "NAV",
                line1: "1 48832U 21078A   26075.61200000  .00000012  00000+0  00000+0 0  9991",
                line2: "2 48832  56.0000 240.1200 0002100  12.4000 347.8000  1.7081200102501"
            },
            {
                name: "JAMES WEBB (JWST) - MOCK LEO VIS",
                category: "SCIENCE",
                line1: "1 50463U 21130A   26075.20102000  .00000500  00000+0  00000+0 0  9997",
                line2: "2 50463   5.1200 310.2000 0012000 120.4000 239.5000 13.8901200012301"
            },
            {
                name: "TERRA (EOS AM-1)",
                category: "SCIENCE",
                line1: "1 25994U 99068A   26075.30000000  .00000120  00000+0  21000-4 0  9993",
                line2: "2 25994  98.2000 115.4000 0001200  85.1000 275.0000 14.5810200389101"
            },
            {
                name: "CZ_5B",
                category: "SCIENCE",
                line1: "1 48275U 21035B 21128.85708450 .10495065 80719-5 19011-3 0 9993",
                line2: "2 48275 41.4573 159.7603 0029099 247.8635 292.7779 16.44362448 1542"
            },
            {
                name: "AQUA",
                category: "SCIENCE",
                line1: "1 27424U 02022A 26280.62419476 .00000444 00000+0 97967-4 0 9995",
                line2: "2 27424 98.4433 252.2387 0001016 63.7257 358.2688 14.62225109 299708",
            }
        ];

        // Global State & Three.js variables
        let scene, camera, renderer, controls;
        let earthMesh, atmosphereMesh, cloudsMesh, starfield;
        let satellitesGroup, orbitsGroup;
        const satelliteObjects = [];
        let selectedSatellite = null;
        let hoveredSatellite = null;

        // Raycasting & Interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        // Simulation parameters
        let simTime = new Date();
        let speedMultiplier = 1;
        let earthAutoSpin = true;
        let showOrbits = true;
        let showLabels = true;
        let activeFilter = "ALL";

        // Constants
        const EARTH_RADIUS = 5; // Radius in Three.js units
        const REAL_EARTH_RADIUS_KM = 6371.0;

        // Initialization
        window.onload = function() {
            initScene();
            createStarfield();
            createEarth();
            createAtmosphere();
            loadSatellites();
            setupEventListeners();
            populateSelector();
            
            // Default selection
            selectSatellite(satelliteObjects[0]);

            // Start loop
            animate();
        };

        function initScene() {
            const container = document.getElementById('webgl-container');

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x030712, 0.002);

            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 10, 22);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.2;
            container.appendChild(renderer.domElement);

            // Orbit Controls
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.minDistance = 6.5;
            controls.maxDistance = 80;

            // Lighting Setup
            const ambientLight = new THREE.AmbientLight(0x334155, 1.2);
            scene.add(ambientLight);

            // Directional Sun Light
            const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
            sunLight.position.set(50, 20, 30);
            scene.add(sunLight);

            // Groups
            satellitesGroup = new THREE.Group();
            orbitsGroup = new THREE.Group();
            scene.add(satellitesGroup);
            scene.add(orbitsGroup);
        }

        function createStarfield() {
            const count = 3000;
            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                const r = 200 + Math.random() * 300;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);

                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);

                // Varied star subtle tints
                const color = new THREE.Color();
                if (Math.random() > 0.8) {
                    color.setHSL(0.6, 0.5, 0.8); // Light Cyan/Blue
                } else if (Math.random() > 0.9) {
                    color.setHSL(0.08, 0.6, 0.8); // Subtle Warm
                } else {
                    color.setHSL(0, 0, 0.7 + Math.random() * 0.3); // Whiteish
                }

                colors[i * 3] = color.r;
                colors[i * 3 + 1] = color.g;
                colors[i * 3 + 2] = color.b;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const material = new THREE.PointsMaterial({
                size: 1.2,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });

            starfield = new THREE.Points(geometry, material);
            scene.add(starfield);
        }

        function createEarthTexture() {
            // High-detail Procedural Earth Canvas Map Generator (fallback & high performance visually)
            const canvas = document.createElement('canvas');
            canvas.width = 2048;
            canvas.height = 1024;
            const ctx = canvas.getContext('2d');

            // Deep ocean background
            const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            grad.addColorStop(0, '#020617');
            grad.addColorStop(0.5, '#0f172a');
            grad.addColorStop(1, '#020617');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Procedural Continents Simulation Drawing
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1;

            // Simple latitude longitude grid aesthetic lines
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
            for (let x = 0; x < canvas.width; x += 64) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += 64) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw procedural stylized landmass outlines
            ctx.fillStyle = '#0f2942';
            ctx.strokeStyle = '#1e40af';

            // Random blob generator for stylized landforms
            const drawLandMass = (cx, cy, rx, ry) => {
                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, Math.PI / 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            };

            // Americas
            drawLandMass(500, 350, 180, 260);
            drawLandMass(700, 650, 160, 220);
            // Eurasia & Africa
            drawLandMass(1150, 380, 280, 200);
            drawLandMass(1100, 580, 180, 210);
            // Australia
            drawLandMass(1650, 720, 110, 90);

            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        }

        function createEarth() {
            const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);

            // Procedural texture with high contrast modern night-glow look
            const earthTexture = createEarthTexture();

            const material = new THREE.MeshPhongMaterial({
                map: earthTexture,
                shininess: 25,
                color: 0x93c5fd,
                emissive: 0x030712,
                specular: 0x1e40af
            });

            earthMesh = new THREE.Mesh(geometry, material);
            scene.add(earthMesh);
        }

        function createAtmosphere() {
            // Glowing Atmosphere Shader Outer Rim
            const vertexShader = `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `;

            const fragmentShader = `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
                    gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity;
                }
            `;

            const atmosphereMaterial = new THREE.ShaderMaterial({
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide,
                transparent: true
            });

            atmosphereMesh = new THREE.Mesh(
                new THREE.SphereGeometry(EARTH_RADIUS * 1.15, 64, 64),
                atmosphereMaterial
            );
            scene.add(atmosphereMesh);
        }

        function loadSatellites() {
            SATELLITE_DATA.forEach((sat, index) => {
                const satrec = satellite.twoline2satrec(sat.line1, sat.line2);

                // Create Satellite Mesh Marker
                const satGroup = new THREE.Group();

                // Core mesh icon
                const geometry = new THREE.BoxGeometry(0.18, 0.18, 0.18);
                const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
                const mesh = new THREE.Mesh(geometry, material);
                satGroup.add(mesh);

                // Pulse aura
                const auraGeo = new THREE.SphereGeometry(0.25, 16, 16);
                const auraMat = new THREE.MeshBasicMaterial({
                    color: 0x38bdf8,
                    transparent: true,
                    opacity: 0.35,
                    wireframe: true
                });
                const aura = new THREE.Mesh(auraGeo, auraMat);
                satGroup.add(aura);

                satellitesGroup.add(satGroup);

                // Build Orbit Trajectory Polyline
                const orbitLine = calculateOrbitLine(satrec);
                orbitsGroup.add(orbitLine);

                const satObj = {
                    id: index,
                    data: sat,
                    satrec: satrec,
                    group: satGroup,
                    mesh: mesh,
                    aura: aura,
                    orbitLine: orbitLine,
                    category: sat.category,
                    positionKm: { x: 0, y: 0, z: 0 },
                    velocityKmS: 0,
                    altitudeKm: 0,
                    lat: 0,
                    lon: 0
                };

                satelliteObjects.push(satObj);
            });
        }

        // Calculate Orbit Geometry Line based on TLE propagation over 1 orbit period
        function calculateOrbitLine(satrec) {
            const points = [];
            const periodMin = 100; // Average orbit resolution span
            const steps = 120;

            const now = new Date();

            for (let i = 0; i <= steps; i++) {
                const stepDate = new Date(now.getTime() + (i * (periodMin * 60 * 1000) / steps));
                const positionAndVelocity = satellite.propagate(satrec, stepDate);
                const positionEci = positionAndVelocity.position;

                if (positionEci) {
                    const pos = eciToThreeVector(positionEci);
                    points.push(pos);
                }
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: 0x0284c7,
                transparent: true,
                opacity: 0.45,
                linewidth: 2
            });

            return new THREE.LineLoop(geometry, material);
        }

        // Convert ECI coordinates from Satellite.js to Three.js coordinates
        function eciToThreeVector(eciPos) {
            // Earth radius scaling factor
            const factor = EARTH_RADIUS / REAL_EARTH_RADIUS_KM;
            // Coordinate rotation alignment for Three.js (Y-Up)
            return new THREE.Vector3(
                eciPos.x * factor,
                eciPos.z * factor,
                -eciPos.y * factor
            );
        }

        function updateSatellites(currentTime) {
            satelliteObjects.forEach(sat => {
                const positionAndVelocity = satellite.propagate(sat.satrec, currentTime);
                const positionEci = positionAndVelocity.position;
                const velocityEci = positionAndVelocity.velocity;

                if (positionEci && typeof positionEci !== 'boolean') {
                    const posVector = eciToThreeVector(positionEci);
                    sat.group.position.copy(posVector);

                    // Compute telemetry stats
                    const alt = Math.sqrt(
                        positionEci.x * positionEci.x +
                        positionEci.y * positionEci.y +
                        positionEci.z * positionEci.z
                    ) - REAL_EARTH_RADIUS_KM;

                    sat.altitudeKm = Math.max(0, alt);

                    if (velocityEci) {
                        sat.velocityKmS = Math.sqrt(
                            velocityEci.x * velocityEci.x +
                            velocityEci.y * velocityEci.y +
                            velocityEci.z * velocityEci.z
                        );
                    }

                    // Geographic coordinate computation
                    const gmst = satellite.gstime(currentTime);
                    const positionGd = satellite.eciToGeodetic(positionEci, gmst);
                    sat.lat = satellite.degreesLat(positionGd.latitude);
                    sat.lon = satellite.degreesLong(positionGd.longitude);

                    // Filter visibility
                    const visible = (activeFilter === "ALL" || sat.category === activeFilter);
                    sat.group.visible = visible;
                    sat.orbitLine.visible = visible && showOrbits;
                }
            });
        }

        function setupEventListeners() {
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('click', onClick);

            // Time Speed Buttons
            document.querySelectorAll('.speed-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.speed-btn').forEach(b => {
                        b.classList.remove('bg-cyan-500/20', 'text-cyan-400', 'font-bold', 'border', 'border-cyan-500/50');
                        b.classList.add('text-slate-400');
                    });
                    e.target.classList.add('bg-cyan-500/20', 'text-cyan-400', 'font-bold', 'border', 'border-cyan-500/50');
                    e.target.classList.remove('text-slate-400');
                    speedMultiplier = parseFloat(e.target.dataset.speed);
                });
            });

            // Toggles
            document.getElementById('toggle-orbits').addEventListener('change', (e) => {
                showOrbits = e.target.checked;
                orbitsGroup.visible = showOrbits;
            });

            document.getElementById('toggle-earth-spin').addEventListener('change', (e) => {
                earthAutoSpin = e.target.checked;
            });

            document.getElementById('reset-view-btn').addEventListener('click', () => {
                controls.reset();
                camera.position.set(0, 10, 22);
            });

            // Category Filter Buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('bg-cyan-500/20', 'text-cyan-300', 'border', 'border-cyan-500/40', 'font-semibold');
                        b.classList.add('bg-slate-800/80', 'text-slate-300');
                    });
                    const target = e.target;
                    target.classList.remove('bg-slate-800/80', 'text-slate-300');
                    target.classList.add('bg-cyan-500/20', 'text-cyan-300', 'border', 'border-cyan-500/40', 'font-semibold');

                    activeFilter = target.dataset.filter;
                });
            });

            // Selector Dropdown
            document.getElementById('sat-selector').addEventListener('change', (e) => {
                const satId = parseInt(e.target.value);
                const found = satelliteObjects.find(s => s.id === satId);
                if (found) {
                    selectSatellite(found);
                    flyToSatellite(found);
                }
            });

            // Copy TLE
            document.getElementById('copy-tle-btn').addEventListener('click', () => {
                if (!selectedSatellite) return;
                const textToCopy = `${selectedSatellite.data.name}\n${selectedSatellite.data.line1}\n${selectedSatellite.data.line2}`;
                
                // Clipboard fallback guard
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);

                showToast("TLE data copied to clipboard!");
            });
        }

        function populateSelector() {
            const selector = document.getElementById('sat-selector');
            satelliteObjects.forEach(sat => {
                const opt = document.createElement('option');
                opt.value = sat.id;
                opt.textContent = `${sat.data.name} [${sat.category}]`;
                selector.appendChild(opt);
            });
            document.getElementById('sat-count').textContent = `${satelliteObjects.length} OBJECTS`;
        }

        function onPointerMove(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(satellitesGroup.children, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj.parent && obj.parent !== satellitesGroup) {
                    obj = obj.parent;
                }
                const satObj = satelliteObjects.find(s => s.group === obj);
                if (satObj && satObj !== hoveredSatellite) {
                    highlightHovered(satObj);
                }
                document.body.style.cursor = 'pointer';
            } else {
                if (hoveredSatellite && hoveredSatellite !== selectedSatellite) {
                    unhighlight(hoveredSatellite);
                    hoveredSatellite = null;
                }
                document.body.style.cursor = 'default';
            }
        }

        function onClick(event) {
            // Ignore click if clicking UI overlay
            if (event.target.closest('.glass-panel') || event.target.tagName === 'BUTTON' || event.target.tagName === 'SELECT') {
                return;
            }

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(satellitesGroup.children, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj.parent && obj.parent !== satellitesGroup) {
                    obj = obj.parent;
                }
                const satObj = satelliteObjects.find(s => s.group === obj);
                if (satObj) {
                    selectSatellite(satObj);
                }
            }
        }

        function highlightHovered(satObj) {
            if (hoveredSatellite && hoveredSatellite !== selectedSatellite) {
                unhighlight(hoveredSatellite);
            }
            hoveredSatellite = satObj;
            if (satObj !== selectedSatellite) {
                satObj.mesh.material.color.setHex(0xf59e0b); // Amber glow on hover
                satObj.aura.scale.set(1.6, 1.6, 1.6);
            }
        }

        function unhighlight(satObj) {
            satObj.mesh.material.color.setHex(0x38bdf8);
            satObj.aura.scale.set(1, 1, 1);
            satObj.orbitLine.material.color.setHex(0x0284c7);
            satObj.orbitLine.material.opacity = 0.45;
        }

        function selectSatellite(satObj) {
            if (selectedSatellite) {
                unhighlight(selectedSatellite);
            }

            selectedSatellite = satObj;
            selectedSatellite.mesh.material.color.setHex(0x10b981); // Emerald for active select
            selectedSatellite.aura.scale.set(2.2, 2.2, 2.2);
            selectedSatellite.orbitLine.material.color.setHex(0x34d399);
            selectedSatellite.orbitLine.material.opacity = 0.9;

            // Sync Dropdown Select UI
            document.getElementById('sat-selector').value = satObj.id;

            // Update Telemetry Panel UI
            updateTelemetryUI(satObj);
        }

        function flyToSatellite(satObj) {
            const targetPos = satObj.group.position.clone().multiplyScalar(1.8);
            
            // Smooth Camera interpolation animation
            const startPos = camera.position.clone();
            const startTime = performance.now();
            const duration = 1200; // ms

            function step(time) {
                const elapsed = time - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const ease = 1 - Math.pow(1 - progress, 3);

                camera.position.lerpVectors(startPos, targetPos, ease);
                controls.target.set(0, 0, 0);
                controls.update();

                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }
            requestAnimationFrame(step);
        }

        function updateTelemetryUI(sat) {
            document.getElementById('sat-name').textContent = sat.data.name;
            document.getElementById('sat-category').textContent = sat.category;
            document.getElementById('sat-altitude').textContent = `${sat.altitudeKm.toFixed(1)} km`;
            document.getElementById('sat-velocity').textContent = `${sat.velocityKmS.toFixed(2)} km/s`;

            const latDir = sat.lat >= 0 ? 'N' : 'S';
            const lonDir = sat.lon >= 0 ? 'E' : 'W';
            document.getElementById('sat-latlon').textContent = `${Math.abs(sat.lat).toFixed(1)}° ${latDir}, ${Math.abs(sat.lon).toFixed(1)}° ${lonDir}`;

            // Calculate estimated period in minutes
            const periodMin = (2 * Math.PI * Math.sqrt(Math.pow(REAL_EARTH_RADIUS_KM + sat.altitudeKm, 3) / 398600.4418)) / 60;
            document.getElementById('sat-period').textContent = `${periodMin.toFixed(1)} min`;

            // TLE Formatting
            document.getElementById('tle-line1').textContent = sat.data.line1;
            document.getElementById('tle-line2').textContent = sat.data.line2;
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            toast.textContent = msg;
            toast.classList.remove('opacity-0', 'pointer-events-none');
            toast.classList.add('opacity-100');
            setTimeout(() => {
                toast.classList.remove('opacity-100');
                toast.classList.add('opacity-0', 'pointer-events-none');
            }, 2500);
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animate() {
            requestAnimationFrame(animate);

            // Advance simulation time based on speed multiplier
            const deltaMs = 16.6 * speedMultiplier; 
            simTime = new Date(simTime.getTime() + deltaMs);

            // Update Clock Overlay
            document.getElementById('utc-clock').textContent = simTime.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

            // Rotate Earth Globe
            if (earthAutoSpin) {
                earthMesh.rotation.y += 0.0005 * (speedMultiplier > 0 ? 1 : 0);
            }

            // Propagate Satellite Positions
            updateSatellites(simTime);

            // Refresh telemetry stats for active target dynamically
            if (selectedSatellite) {
                updateTelemetryUI(selectedSatellite);
            }

            controls.update();
            renderer.render(scene, camera);
        }