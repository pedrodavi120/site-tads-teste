document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica do Three.js para o Fundo 3D ---
    const initThreeJS = () => {
        const mount = document.getElementById('three-bg');
        if (!mount || !window.THREE) {
            console.error("Three.js container or library not found.");
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        mount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0x00aeff, 1.5, 100);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        const geometry = new THREE.SphereGeometry(1.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00aeff,
            wireframe: true,
            roughness: 0.5,
            metalness: 0.7,
        });
        const earth = new THREE.Mesh(geometry, material);
        scene.add(earth);

        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 5000;
        const posArray = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 200;
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const starsMaterial = new THREE.PointsMaterial({ size: 0.015, color: 0xffffff });
        const starMesh = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(starMesh);

        let mouseX = 0, mouseY = 0;
        const handleMouseMove = (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            requestAnimationFrame(animate);
            earth.rotation.y += 0.0005;
            earth.rotation.x += 0.0005;
            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);
            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);
    };

    // --- Lógica da Animação do Título ---
    const animateTitle = () => {
        const title = document.getElementById('main-title');
        if (!title) return;
        const text = title.textContent.trim();
        title.innerHTML = '';
        text.split("").forEach((char, index) => {
            const span = document.createElement('span');
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.animationDelay = `${index * 0.03}s`;
            title.appendChild(span);
        });
    };

    // --- Lógica do GooeyNav ---
    const navContainer = document.getElementById('gooey-nav-container');
    const navList = document.getElementById('nav-list');
    const navItems = navList.querySelectorAll('li');
    const effectFilter = document.getElementById('effect-filter');
    const effectText = document.getElementById('effect-text');
    
    let activeIndex = 0;
    const animationTime = 600, particleCount = 15, particleDistances = [90, 10], particleR = 100, timeVariance = 300;
    const colors = [1, 2, 3, 1, 2, 3, 1, 4];

    const updateEffectPosition = (element) => {
        if (!navContainer || !effectFilter || !effectText || !element) return;
        const containerRect = navContainer.getBoundingClientRect();
        const pos = element.getBoundingClientRect();
        effectFilter.style.left = `${pos.x - containerRect.x}px`;
        effectFilter.style.top = `${pos.y - containerRect.y}px`;
        effectFilter.style.width = `${pos.width}px`;
        effectFilter.style.height = `${pos.height}px`;
        effectText.style.left = `${pos.x - containerRect.x}px`;
        effectText.style.top = `${pos.y - containerRect.y}px`;
        effectText.style.width = `${pos.width}px`;
        effectText.style.height = `${pos.height}px`;
        effectText.textContent = element.querySelector('a').textContent;
    };
    
    const makeParticles = (element) => {
        const d = particleDistances, r = particleR;
        const noise = (n = 1) => n / 2 - Math.random() * n;
        const getXY = (distance, pointIndex, totalPoints) => {
            const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
            return [distance * Math.cos(angle), distance * Math.sin(angle)];
        };
        const createParticle = (i, t, d, r) => {
            let rotate = noise(r / 10);
            return {
                start: getXY(d[0], particleCount - i, particleCount),
                end: getXY(d[1] + noise(7), particleCount - i, particleCount),
                time: t,
                scale: 1 + noise(0.2),
                color: colors[Math.floor(Math.random() * colors.length)],
                rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
            };
        };

        for (let i = 0; i < particleCount; i++) {
            const t = animationTime * 2 + noise(timeVariance * 2);
            const p = createParticle(i, t, d, r);
            setTimeout(() => {
                const particle = document.createElement('span');
                const point = document.createElement('span');
                particle.classList.add('particle');
                point.classList.add('point');
                particle.style.setProperty('--start-x', `${p.start[0]}px`);
                particle.style.setProperty('--start-y', `${p.start[1]}px`);
                particle.style.setProperty('--end-x', `${p.end[0]}px`);
                particle.style.setProperty('--end-y', `${p.end[1]}px`);
                particle.style.setProperty('--time', `${p.time}ms`);
                particle.style.setProperty('--scale', `${p.scale}`);
                particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
                particle.style.setProperty('--rotate', `${p.rotate}deg`);
                particle.appendChild(point);
                element.appendChild(particle);
                setTimeout(() => { try { element.removeChild(particle); } catch {} }, t);
            }, 30);
        }
    };
    
    const setActiveNavItem = (index) => {
        activeIndex = index;
        navItems.forEach((li, i) => {
            li.classList.toggle('active', i === index);
        });
        updateEffectPosition(navItems[index]);
    };

    navItems.forEach((li, index) => {
        li.querySelector('a').addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = e.currentTarget.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });

            // A lógica de ativação agora é centralizada no IntersectionObserver
            // mas podemos disparar a animação de partículas no clique.
            updateEffectPosition(li);
            effectFilter.innerHTML = '';
            makeParticles(effectFilter);
            effectText.classList.remove('active');
            void effectText.offsetWidth;
            effectText.classList.add('active');
        });
    });

    navList.addEventListener('mouseleave', () => {
        updateEffectPosition(navItems[activeIndex]);
    });

    // --- Lógica de Scrollspy para o Menu ---
    const sections = document.querySelectorAll('main section');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = Array.from(sections).indexOf(entry.target);
                if(index > -1) {
                    setActiveNavItem(index);
                }
            }
        });
    }, { rootMargin: "-30% 0px -70% 0px", threshold: 0 });

    sections.forEach(section => scrollObserver.observe(section));
    
    // --- Lógica para Animação de Scroll ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                animationObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(el => animationObserver.observe(el));

    // --- Inicialização ---
    initThreeJS();
    animateTitle();
    // Define o estado inicial do menu
    setActiveNavItem(0);
    effectFilter.classList.add('active');
    effectText.classList.add('active');
});
