import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { parcels, roads, landmarks } from './data.js';
import './style.css';

const host = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#111b23');
scene.fog = new THREE.Fog('#111b23', 1900, 3600);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 1, 5000);
camera.position.set(1170, 1110, 1420);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.96;
host.appendChild(renderer.domElement);
const labels = new CSS2DRenderer();
labels.setSize(innerWidth, innerHeight);
labels.domElement.className = 'labels-layer';
host.appendChild(labels.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 15);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 550;
controls.maxDistance = 2700;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.y = 0;

scene.add(new THREE.HemisphereLight('#d7e9e5', '#1c2b32', 1.15));
const sun = new THREE.DirectionalLight('#fff2d8', 2.1);
sun.position.set(-450, 1100, 700);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -1200; sun.shadow.camera.right = 1200;
sun.shadow.camera.top = 1200; sun.shadow.camera.bottom = -1200;
scene.add(sun);
scene.add(new THREE.AmbientLight('#8ba8b0', 0.22));

const world = new THREE.Group();
scene.add(world);
const base = new THREE.Group();
const water = new THREE.Group();
const roadLayer = new THREE.Group();
const buildingLayer = new THREE.Group();
const landmarkLayer = new THREE.Group();
world.add(base, water, roadLayer, buildingLayer, landmarkLayer);
const material = (color, roughness = 0.84) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.04 });
const groundMat = material('#b8c4b9');

function flatPolygon(points, y, mat, parent, name = '') {
  const s = new THREE.Shape();
  points.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z));
  s.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = y;
  mesh.receiveShadow = true;
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}
function slab(x, z, w, d, y, mat, parent, name = '') {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, 1, d), mat);
  mesh.position.set(x, y, z); mesh.receiveShadow = true; mesh.name = name;
  parent.add(mesh); return mesh;
}
function addLabel(text, className, x, y, z, parent, offset = '') {
  const el = document.createElement('div');
  el.className = `${className} ${offset}`;
  el.textContent = text;
  const label = new CSS2DObject(el);
  label.position.set(x, y, z); parent.add(label); return label;
}

// Land mass and the two waterways frame the real Expo A-block composition.
flatPolygon([[-940,-760],[720,-760],[720,710],[-940,710]], -8, groundMat, base, 'district-ground');
flatPolygon([[-1450,-900],[-845,-900],[-835,760],[-1450,760]], -3, material('#326c78', 0.55), water, 'huangpu-river');
flatPolygon([[430,-860],[550,-860],[560,-700],[700,-640],[900,-620],[900,-510],[600,-515],[480,-590]], -2, material('#397f89', 0.54), water, 'bailianjing-north');
flatPolygon([[645,-590],[740,-585],[760,500],[700,680],[610,700],[610,465],[655,260]], -2, material('#397f89', 0.54), water, 'bailianjing-east');
slab(-885, -25, 8, 1470, 1, material('#8ab2a7'), base, 'west-riverside');
slab(638, 10, 8, 1240, 1, material('#8ab2a7'), base, 'east-riverside');
addLabel('黄 浦 江', 'water-label', -1160, 25, -25, water);
addLabel('白 莲 泾', 'water-label', 670, 15, -465, water);

// Public-space patches provide landmarks and a readable precinct scale.
flatPolygon([[-520,-455],[-180,-455],[-180,-300],[-520,-300]], -1, material('#829b80'), base, 'expo-park');
flatPolygon([[-480,205],[-270,205],[-270,485],[-480,485]], -1, material('#829b80'), base, 'culture-center-park');
flatPolygon([[-50,250],[355,250],[355,565],[-50,565]], -1, material('#91a987'), base, 'green-valley-landscape');
for (let i = 0; i < 75; i++) {
  const x = -445 + (i * 67 % 800), z = -500 + (i * 101 % 1030);
  if ((x > -540 && x < -250 && z > 180) || (x > -40 && x < 365 && z > 245 && z < 570)) {
    const tree = new THREE.Mesh(new THREE.ConeGeometry(4.7, 13 + (i % 3) * 2, 5), material(i % 3 ? '#47756d' : '#62866e'));
    tree.position.set(x, 7, z); tree.castShadow = true; base.add(tree);
  }
}

const roadMat = material('#646f70', 0.92);
const minorRoadMat = material('#87918c', 0.95);
const roadWidth = { major: 24, minor: 13 };
const roadLabels = [];
for (const road of roads) {
  const [a, b] = road.points; const dx = b[0] - a[0], dz = b[1] - a[1];
  const len = Math.hypot(dx, dz), width = roadWidth[road.kind];
  const m = new THREE.Mesh(new THREE.BoxGeometry(Math.abs(dx) < 0.001 ? width : len, 2, Math.abs(dx) < 0.001 ? len : width), road.kind === 'major' ? roadMat : minorRoadMat);
  m.position.set((a[0] + b[0]) / 2, 0, (a[1] + b[1]) / 2); m.receiveShadow = true;
  roadLayer.add(m);
  const labelAt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const roadLabel = addLabel(road.name, 'road-label', labelAt[0], 7, labelAt[1], roadLayer, Math.abs(dx) < 0.001 ? 'road-vertical' : '');
  roadLabels.push(roadLabel);
  // Fine dashed median for the main avenue gives the arterial hierarchy a light visual cue.
  if (road.name === '世博大道' || road.name === '耀华路') {
    for (let x = -680; x < 690; x += 44) slab(x, labelAt[1], 20, 1.2, 1.3, material('#bdc0ad'), roadLayer, 'road-mark');
  }
}

const parcelPlots = [];
const parcelObjects = new Map();
const neutralBuilding = material('#c4d2cc', 0.7);
const glassBuilding = material('#6f98a1', 0.36);
const warmBuilding = material('#b6a286', 0.78);
const shadowBuilding = material('#59747d', 0.48);
const terracotta = material('#b84234', 0.72);
const selectionMat = new THREE.LineBasicMaterial({ color: '#e6ad60', transparent: true, opacity: 0.95 });
let selected = null;
function towerGeometry(parcel) {
  const g = new THREE.Group();
  const { x, z, w, d, h, style } = parcel;
  const color = style === 'gold' ? warmBuilding : style === 'lowrise' ? glassBuilding : style === 'bank' ? shadowBuilding : neutralBuilding;
  const body = new THREE.Mesh(new THREE.BoxGeometry(w * 0.72, h, d * 0.74), color);
  body.position.set(x, h / 2 + 2, z); body.castShadow = true; body.receiveShadow = true; g.add(body);
  if (style === 'nuclear') {
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w * 0.78, 16, d * 0.83), material('#e2e6dc'));
    crown.position.set(x, h + 10, z); crown.castShadow = true; g.add(crown);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.56, 5, d * 0.63), material('#647e85'));
    cap.position.set(x, h + 20, z); g.add(cap);
  } else if (style === 'union') {
    const sideLeft = new THREE.Mesh(new THREE.BoxGeometry(w * 0.16, h * 0.46, d * 0.8), glassBuilding);
    sideLeft.position.set(x - w * 0.42, h * 0.72, z); sideLeft.castShadow = true; g.add(sideLeft);
    const sideRight = sideLeft.clone(); sideRight.position.x = x + w * 0.42; g.add(sideRight);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 0.42, 10, d * 0.9), material('#d6e0dc'));
    cap.position.set(x, h + 7, z); g.add(cap);
  } else if (style === 'bank') {
    const terrace1 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 14, d * 0.85), material('#90a7a6'));
    terrace1.position.set(x, h + 7, z); terrace1.castShadow = true; g.add(terrace1);
    const terrace2 = new THREE.Mesh(new THREE.BoxGeometry(w * 0.62, 8, d * 0.67), material('#d1d8cf'));
    terrace2.position.set(x, h + 18, z); g.add(terrace2);
  } else if (style === 'gold') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.33, w * 0.4, 12, 4), material('#d4b36e'));
    crown.position.set(x, h + 7, z); crown.rotation.y = Math.PI / 4; g.add(crown);
  } else if (style === 'lowrise') {
    const upper = new THREE.Mesh(new THREE.BoxGeometry(w * 0.58, h * 0.2, d * 0.64), material('#d9e0d9'));
    upper.position.set(x + w * 0.06, h * 1.08, z); upper.castShadow = true; g.add(upper);
    const podium = new THREE.Mesh(new THREE.BoxGeometry(w, 5, d), material('#aab9a5'));
    podium.position.set(x, 4, z); g.add(podium);
  }
  return g;
}

function parcelOutline(x, z, w, d) {
  const points = [new THREE.Vector3(x-w/2, 1.5, z-d/2), new THREE.Vector3(x+w/2, 1.5, z-d/2), new THREE.Vector3(x+w/2, 1.5, z+d/2), new THREE.Vector3(x-w/2, 1.5, z+d/2)];
  return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#d5ded5', transparent: true, opacity: 0.52 }));
}

for (const p of parcels) {
  const g = new THREE.Group(); g.userData = { parcel: p, selectable: true };
  const plotMat = new THREE.MeshStandardMaterial({ color: p.group ? '#839882' : '#909e91', roughness: 0.94, transparent: true, opacity: 0.62 });
  const plot = slab(p.x, p.z, p.w, p.d, -0.8, plotMat, g, `parcel-${p.id}`);
  plot.userData = { owner: g };
  g.add(parcelOutline(p.x, p.z, p.w, p.d));
  g.add(towerGeometry(p));
  const nameLabel = addLabel(p.name, 'building-label', p.x, p.h + 28, p.z, g);
  if ([3, 9, 15, 17].includes(p.id)) nameLabel.element.dataset.priority = '1';
  buildingLayer.add(g); parcelPlots.push(plot); parcelObjects.set(p.id, { group: g, plot, parcel: p, plotMat });
}

// Green Valley is a group boundary around the seven independently selectable PuYin plots.
const gv = new THREE.Group(); gv.userData = { selectable: true, parcel: { id: 16, name: '绿谷组团', description: '组团范围内含浦银中心 A 至 G 座；七栋建筑分别建模、可独立选择。' } };
gv.userData.parcel.x = 100; gv.userData.parcel.z = 390;
const gvHit = flatPolygon([[-172,218],[390,218],[390,565],[-172,565]], 1.25,
  new THREE.MeshBasicMaterial({ color: '#9cb291', transparent: true, opacity: 0.018, side: THREE.DoubleSide }), gv, 'green-valley-select-area');
gvHit.userData = { owner: gv };
const gvOutline = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([
  [-172,1.9,218],[390,1.9,218],[390,1.9,565],[-172,1.9,565]
].map(v => new THREE.Vector3(...v))), new THREE.LineBasicMaterial({ color: '#d5ded5', transparent: true, opacity: 0.75 }));
gv.add(gvOutline); addLabel('绿谷 · 浦银中心组团', 'group-label', 100, 18, 565, gv);
buildingLayer.add(gv); parcelPlots.push(gvOutline); parcelObjects.set(16, { group: gv, plot: gvOutline, parcel: gv.userData.parcel, plotMat: null });

function addLandmark(item, style) {
  const g = new THREE.Group(); const { x,z,w,d,h,name } = item;
  const plot = slab(x,z,w,d,-0.3,material('#9d9b87'),g,`landmark-${name}`); plot.userData = { owner:g };
  g.add(parcelOutline(x,z,w,d));
  if (style === 'china') {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w*1.08, 18, d*1.08), material('#e6e1d1'));
    plinth.position.set(x, 9, z); plinth.castShadow = true; g.add(plinth);
    const baseMass = new THREE.Mesh(new THREE.BoxGeometry(w, 40, d), terracotta);
    baseMass.position.set(x, 38, z); baseMass.castShadow = true; g.add(baseMass);
    for (let i=0;i<4;i++) {
      const tier = new THREE.Mesh(new THREE.BoxGeometry(w*(0.98-i*0.13), 14, d*(0.98-i*0.13)), i===3 ? material('#d17851') : material('#a9322d'));
      tier.position.set(x, 65 + i*16, z); tier.castShadow = true; g.add(tier);
    }
    const crown = new THREE.Mesh(new THREE.BoxGeometry(w*0.42, 15, d*0.42), material('#c7503c'));
    crown.position.set(x, 137, z); crown.castShadow = true; g.add(crown);
  } else {
    const main = new THREE.Mesh(new THREE.BoxGeometry(w*0.82,h,d*0.84), material('#bfcac2'));
    main.position.set(x,h/2,z); main.castShadow = true; g.add(main);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w*0.9,6,d*0.92), material('#e0dfce'));
    roof.position.set(x,h+3,z); g.add(roof);
  }
  g.userData = { selectable:true, parcel:{ id:100+Object.keys(landmarks).length, name, description: style === 'china' ? '原上海世博会中国国家馆，现为中华艺术宫。标志性“东方之冠”造型。' : '世博园区永久场馆，作为片区尺度与空间关系参照。' }, plot };
  addLabel(name, 'landmark-label', x, h+45, z, g);
  landmarkLayer.add(g); parcelPlots.push(plot); return g;
}
const chinaMuseum = addLandmark(landmarks.chinaMuseum, 'china');
addLandmark(landmarks.expoCenter, 'hall');
addLandmark(landmarks.expoAxis, 'hall');
addLandmark(landmarks.cultureCenter, 'hall');

const picker = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let down = null;
renderer.domElement.addEventListener('pointerdown', e => { down = [e.clientX,e.clientY]; });
renderer.domElement.addEventListener('click', e => {
  if (!down || Math.hypot(e.clientX-down[0],e.clientY-down[1]) > 5) { down = null; return; }
  down = null;
  pointer.x = e.clientX / innerWidth * 2 - 1; pointer.y = -(e.clientY / innerHeight) * 2 + 1;
  picker.setFromCamera(pointer,camera);
  const hits = picker.intersectObjects(world.children,true);
  const hit = hits.find(h => {
    let o=h.object; while(o && !o.userData.selectable && !o.userData.owner) o=o.parent;
    return o?.userData.selectable || o?.userData.owner;
  });
  if (!hit) return;
  let owner=hit.object; while(owner && !owner.userData.selectable) owner=owner.userData.owner || owner.parent;
  if (owner?.userData.selectable) select(owner);
});
function select(group) {
  if (selected?.userData?.plotMat) selected.userData.plotMat.color.set('#909e91');
  if (selected?.userData?.highlight) { selected.remove(selected.userData.highlight); selected.userData.highlight = null; }
  selected = group;
  const p = group.userData.parcel;
  const entry = parcelObjects.get(p.id);
  if (entry?.plotMat) { entry.plotMat.color.set('#dfa75e'); selected.userData.plotMat = entry.plotMat; }
  if (entry && !entry.plotMat && group !== selected) { /* group boundaries retain their styling */ }
  document.querySelector('#info-name').textContent = p.name;
  document.querySelector('#info-desc').textContent = p.description || `世博 A 地块第 ${p.id} 号楼宇，场景高度为示意值。`;
  document.querySelector('#info-tag').textContent = p.group ? '绿谷 · 浦银中心组团' : (p.id <= 23 ? `地块 ${String(p.id).padStart(2,'0')}` : '片区地标');
  document.querySelector('#info-height').textContent = p.h ? `示意高度 ${p.h} m` : '特色地标';
  document.querySelector('#info-card').classList.add('visible');
  controls.target.set(p.x || 0,0,p.z || 0);
}

let labelFrame = 0;
function resolveLabelCollisions() {
  if (++labelFrame % 6) return;
  const nodes = [...document.querySelectorAll('.building-label,.landmark-label,.group-label,.road-label,.water-label')];
  const rank = el => el.classList.contains('landmark-label') ? 0 : el.classList.contains('group-label') ? 1 : el.dataset.priority ? 2 : el.classList.contains('building-label') ? 3 : el.classList.contains('road-label') ? 4 : 5;
  nodes.sort((a,b) => rank(a)-rank(b));
  const occupied = [];
  const panels = [...document.querySelectorAll('.topbar,.left-panel,.info-card.visible,.bottom-left,.bottom-right,.compass')].map(el => el.getBoundingClientRect());
  for (const el of nodes) {
    el.classList.remove('collision-hide');
    if (el.classList.contains('hidden-label')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const intersects = b => r.left < b.right+3 && r.right > b.left-3 && r.top < b.bottom+2 && r.bottom > b.top-2;
    if (panels.some(intersects) || occupied.some(intersects)) { el.classList.add('collision-hide'); continue; }
    occupied.push(r);
  }
}

document.querySelector('#overview').addEventListener('click', () => {
  controls.target.set(0,0,15); camera.position.set(1170,1110,1420); controls.update();
  document.querySelector('#info-card').classList.remove('visible');
  if (selected?.userData?.plotMat) selected.userData.plotMat.color.set('#909e91');
  selected=null;
});
document.querySelector('#close-info').addEventListener('click', () => document.querySelector('#info-card').classList.remove('visible'));
document.querySelector('#labels-toggle').addEventListener('change', e => document.querySelectorAll('.building-label,.landmark-label,.group-label').forEach(el => el.classList.toggle('hidden-label',!e.target.checked)));
document.querySelector('#roads-toggle').addEventListener('change', e => document.querySelectorAll('.road-label').forEach(el => el.classList.toggle('hidden-label',!e.target.checked)));
document.querySelector('#buildings-toggle').addEventListener('change', e => { buildingLayer.visible = e.target.checked; landmarkLayer.visible = e.target.checked; });
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight); labels.setSize(innerWidth,innerHeight);
});

document.querySelector('#loading').classList.add('done');
renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene,camera); labels.render(scene,camera); resolveLabelCollisions(); });
