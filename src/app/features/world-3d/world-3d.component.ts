import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import * as THREE from 'three';
import { StateService } from '../../core/services/state.service';
import { Island } from '../../core/models/archipelago.model';

@Component({
  selector: 'app-world-3d',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="relative w-full h-[calc(100vh-65px)] overflow-hidden select-none bg-slate-950">
      <!-- 3D Canvas Container -->
      <div #canvasContainer class="w-full h-full cursor-grab active:cursor-grabbing"></div>

      <!-- Top Overlay Controls & Island Filter -->
      <div class="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div class="glass-panel px-4 py-2 rounded-xl flex items-center gap-3 pointer-events-auto border border-white/10 shadow-lg shadow-black/40">
          <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <div>
            <div class="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
              <span>{{ t().world.title }}</span>
              <span class="text-[10px] text-emerald-400 font-mono">16 ISLANDS + ZERO</span>
            </div>
            <div class="text-[10px] text-slate-400">
              {{ t().world.orbitControlsHelp }}
            </div>
          </div>
        </div>

        <!-- Mode Toggle & Quick Jump -->
        <div class="flex items-center gap-2 pointer-events-auto">
          <button
            (click)="switchTo2D()"
            class="glass-panel px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-white/10 flex items-center gap-1.5 shadow-lg"
          >
            <mat-icon class="text-sm text-cyan-400">map</mat-icon>
            <span>{{ t().world.mode2D }}</span>
          </button>

          <button
            (click)="resetCamera()"
            class="glass-panel p-2 rounded-xl text-slate-300 hover:text-white transition-all border border-white/10 shadow-lg"
            title="Скинути камеру"
          >
            <mat-icon class="text-sm">center_focus_strong</mat-icon>
          </button>
        </div>
      </div>

      <!-- Quick Island Bar (Bottom Scrollable) -->
      <div class="absolute bottom-4 left-4 right-4 pointer-events-none z-10 flex flex-col gap-2">
        <!-- Floating Hover / Active Island Card -->
        @if (hoveredIsland(); as isl) {
          <div
            class="self-center pointer-events-auto glass-panel-elevated p-4 rounded-2xl border border-white/15 max-w-sm w-full shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col gap-3"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                  [style.background]="isl.theme.primary"
                >
                  <mat-icon class="text-xl">{{ isl.theme.icon }}</mat-icon>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-white flex items-center gap-1.5">
                    {{ isl.name }}
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-normal uppercase" [class]="isl.theme.badgeBg">
                      {{ isl.difficulty }}
                    </span>
                  </h3>
                  <div class="text-xs text-slate-400 font-mono">
                    {{ isl.language.toUpperCase() }}
                  </div>
                </div>
              </div>

              <div class="text-right">
                <div class="text-sm font-extrabold text-emerald-400 font-mono">
                  {{ isl.progress }}%
                </div>
                <div class="text-[10px] text-slate-400">
                  {{ isl.completedLessons }}/{{ isl.totalLessons }} уроків
                </div>
              </div>
            </div>

            <!-- Progress bar -->
            <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                [style.width.%]="isl.progress"
                [style.background]="isl.theme.primary"
              ></div>
            </div>

            <p class="text-xs text-slate-300 leading-snug line-clamp-2">
              {{ isl.description }}
            </p>

            <button
              (click)="enterIsland(isl.id)"
              class="w-full py-2.5 rounded-xl font-bold text-xs tracking-wider text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 hover:opacity-95"
              [style.background]="isl.theme.primary"
            >
              <span>{{ t().world.enterIsland }}</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>
        }

        <!-- Mini archipelago quick navigation pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto py-1 px-2 pointer-events-auto bg-slate-950/70 backdrop-blur-md rounded-2xl border border-white/10 self-center max-w-full">
          @for (island of islands(); track island.id) {
            <button
              (click)="selectIsland(island)"
              [class]="hoveredIsland()?.id === island.id ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40' : 'text-slate-400 hover:text-white bg-slate-900/60 border-white/5'"
              class="px-2.5 py-1.5 rounded-xl border text-[11px] font-mono whitespace-nowrap transition-all flex items-center gap-1.5"
            >
              <span class="w-2 h-2 rounded-full" [style.background]="island.theme.primary"></span>
              <span>{{ island.name.replace(' Island', '') }}</span>
              <span class="text-[9px] opacity-70">{{ island.progress }}%</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class World3DComponent implements OnInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  private state = inject(StateService);
  readonly t = this.state.t;
  readonly islands = this.state.islands;
  readonly hoveredIsland = signal<Island | null>(this.islands()[0]);

  // Three.js instances
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private animFrameId: number | null = null;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private oceanMesh!: THREE.Mesh;
  private islandMeshes = new Map<string, THREE.Group>();
  private particleSystem!: THREE.Points;

  // Interaction controls state
  private isPointerDown = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  private spherical = { radius: 120, theta: Math.PI / 4, phi: Math.PI / 3.2 };
  private targetLookAt = new THREE.Vector3(0, 2, 0);

  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initThree();
      this.bindEvents();
    }
  }

  ngOnDestroy() {
    if (this.animFrameId !== null && isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThree() {
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (window.innerHeight - 65);

    // Scene with dark atmosphere fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x030712);
    this.scene.fog = new THREE.FogExp2(0x030712, 0.007);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    this.updateCameraPos();

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.4);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xecfdf5, 1.4);
    dirLight.position.set(60, 100, 40);
    this.scene.add(dirLight);

    const secondaryLight = new THREE.DirectionalLight(0x818cf8, 0.6);
    secondaryLight.position.set(-60, 40, -40);
    this.scene.add(secondaryLight);

    // Build Archipelago Entities
    this.createOcean();
    this.createParticles();
    this.buildIslands();

    // Start render loop
    this.animate();
  }

  private createOcean() {
    const geo = new THREE.PlaneGeometry(350, 350, 48, 48);
    geo.rotateX(-Math.PI / 2);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x021727,
      roughness: 0.1,
      metalness: 0.8,
      flatShading: true,
      wireframe: false
    });

    this.oceanMesh = new THREE.Mesh(geo, mat);
    this.oceanMesh.position.y = -0.5;
    this.scene.add(this.oceanMesh);

    // Grid sea lines for digital aesthetic
    const gridHelper = new THREE.GridHelper(350, 70, 0x10b981, 0x0f293d);
    gridHelper.position.y = -0.4;
    this.scene.add(gridHelper);
  }

  private createParticles() {
    const particleCount = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 300;
      positions[i + 1] = Math.random() * 50 + 2;
      positions[i + 2] = (Math.random() - 0.5) * 300;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 1.2,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  private buildIslands() {
    const islandList = this.islands();

    islandList.forEach(isl => {
      const group = new THREE.Group();
      group.position.set(isl.position.x, 0, isl.position.z);
      group.name = isl.id;

      const isZero = isl.id === 'zero';
      const radius = isZero ? 14 : 7;
      const height = isZero ? 4 : 2.5;

      // Low-poly terrain base
      const terrainGeo = new THREE.CylinderGeometry(radius * 0.85, radius * 1.15, height, 8, 2);
      // Displace vertices slightly for organic low-poly feel
      const pos = terrainGeo.attributes['position'];
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        if (y > 0) {
          pos.setY(i, y + (Math.sin(i * 1.5) * 0.6));
        }
      }
      terrainGeo.computeVertexNormals();

      const terrainMat = new THREE.MeshStandardMaterial({
        color: isZero ? 0x064e3b : 0x0f172a,
        roughness: 0.6,
        metalness: 0.2,
        flatShading: true
      });
      const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
      terrainMesh.position.y = height / 2;
      group.add(terrainMesh);

      // Neon Island Ring border
      const ringGeo = new THREE.RingGeometry(radius * 1.1, radius * 1.22, 16);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(isl.theme.primary),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.y = 0.1;
      group.add(ringMesh);

      // Central Technology Crystal / Spire
      const crystalGeo = new THREE.OctahedronGeometry(isZero ? 3.5 : 1.8, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(isl.theme.primary),
        roughness: 0.1,
        metalness: 0.9,
        emissive: new THREE.Color(isl.theme.primary),
        emissiveIntensity: 0.4
      });
      const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
      crystalMesh.position.y = height + (isZero ? 5 : 3.5);
      crystalMesh.name = 'crystal';
      group.add(crystalMesh);

      // Point Light per island for localized glow
      const pointLight = new THREE.PointLight(isl.theme.primary, isZero ? 2.5 : 1.2, 35);
      pointLight.position.y = height + 4;
      group.add(pointLight);

      // Orbiting ring around crystal
      const orbitRingGeo = new THREE.TorusGeometry(isZero ? 4.5 : 2.5, 0.08, 6, 24);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(isl.theme.primary),
        transparent: true,
        opacity: 0.6
      });
      const orbitRing = new THREE.Mesh(orbitRingGeo, orbitMat);
      orbitRing.position.y = crystalMesh.position.y;
      orbitRing.rotation.x = Math.PI / 3;
      orbitRing.name = 'orbitRing';
      group.add(orbitRing);

      this.scene.add(group);
      this.islandMeshes.set(isl.id, group);
    });
  }

  private animate = () => {
    this.animFrameId = requestAnimationFrame(this.animate);

    const time = performance.now() * 0.001;

    // Gentle ocean wave animation
    if (this.oceanMesh) {
      const pos = this.oceanMesh.geometry.attributes['position'];
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const w = pos.getZ(i);
        pos.setY(i, Math.sin(u * 0.06 + time) * Math.cos(w * 0.06 + time) * 0.6 - 0.5);
      }
      pos.needsUpdate = true;
    }

    // Crystals floating & rotating
    this.islandMeshes.forEach(grp => {
      const crystal = grp.getObjectByName('crystal');
      const ring = grp.getObjectByName('orbitRing');
      if (crystal) {
        crystal.rotation.y = time * 0.8;
        crystal.position.y += Math.sin(time * 2 + grp.position.x) * 0.006;
      }
      if (ring) {
        ring.rotation.z = time * 0.6;
        ring.rotation.y = time * 0.3;
      }
    });

    // Particle drift
    if (this.particleSystem) {
      this.particleSystem.rotation.y = time * 0.02;
    }

    this.renderer.render(this.scene, this.camera);
  };

  private updateCameraPos() {
    const x = this.targetLookAt.x + this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    const y = this.targetLookAt.y + this.spherical.radius * Math.cos(this.spherical.phi);
    const z = this.targetLookAt.z + this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);
    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.targetLookAt);
  }

  private bindEvents() {
    const el = this.containerRef.nativeElement;

    el.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
    });

    window.addEventListener('pointerup', () => {
      this.isPointerDown = false;
    });

    el.addEventListener('pointermove', (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.isPointerDown) {
        const deltaX = e.clientX - this.prevPointerX;
        const deltaY = e.clientY - this.prevPointerY;
        this.prevPointerX = e.clientX;
        this.prevPointerY = e.clientY;

        this.spherical.theta -= deltaX * 0.006;
        this.spherical.phi = Math.max(0.2, Math.min(Math.PI / 2.1, this.spherical.phi - deltaY * 0.006));
        this.updateCameraPos();
      } else {
        this.checkHover();
      }
    });

    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(30, Math.min(240, this.spherical.radius + e.deltaY * 0.1));
      this.updateCameraPos();
    }, { passive: false });

    el.addEventListener('click', () => {
      const hit = this.checkHover();
      if (hit) {
        this.selectIsland(hit);
      }
    });

    window.addEventListener('resize', () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  private checkHover(): Island | null {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const groups = Array.from(this.islandMeshes.values());
    const intersects = this.raycaster.intersectObjects(groups, true);

    if (intersects.length > 0) {
      let topObj: THREE.Object3D | null = intersects[0].object;
      while (topObj && !this.islandMeshes.has(topObj.name) && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && this.islandMeshes.has(topObj.name)) {
        const matched = this.islands().find(i => i.id === topObj!.name);
        if (matched) {
          this.hoveredIsland.set(matched);
          return matched;
        }
      }
    }
    return null;
  }

  selectIsland(isl: Island) {
    this.hoveredIsland.set(isl);
    // Smooth camera refocus
    this.targetLookAt.set(isl.position.x, 2, isl.position.z);
    this.spherical.radius = 60;
    this.updateCameraPos();
  }

  enterIsland(islandId: string) {
    this.state.openIsland(islandId);
  }

  switchTo2D() {
    this.state.setView('map2d');
  }

  resetCamera() {
    this.targetLookAt.set(0, 2, 0);
    this.spherical.radius = 120;
    this.spherical.theta = Math.PI / 4;
    this.spherical.phi = Math.PI / 3.2;
    this.updateCameraPos();
  }
}
