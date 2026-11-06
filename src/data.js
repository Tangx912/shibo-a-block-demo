// Scene coordinates use the uploaded aerial map as the relative placement reference.
// Axes: x east, z south. Parcel locations are intentionally separated by streets/setbacks.
export const parcels = [
  { id: 1, name: '华泰金融大厦', x: -370, z: 430, w: 92, d: 66, h: 150, style: 'tower' },
  { id: 2, name: '华林国际金融大厦', x: -300, z: 360, w: 88, d: 74, h: 132, style: 'tower' },
  { id: 3, name: '中核集团上海总部大楼', x: -210, z: 270, w: 92, d: 82, h: 178, style: 'nuclear' },
  { id: 4, name: '国电投大厦（上电大厦）', x: -110, z: 245, w: 90, d: 74, h: 145, style: 'tower' },
  { id: 5, name: '吉富大厦', x: -35, z: 165, w: 72, d: 70, h: 112, style: 'tower' },
  { id: 6, name: '金龙鱼大厦', x: -150, z: 75, w: 82, d: 66, h: 128, style: 'gold' },
  { id: 7, name: '远企大楼', x: -235, z: -30, w: 82, d: 70, h: 123, style: 'tower' },
  { id: 8, name: '浦发银行大厦', x: -105, z: -140, w: 86, d: 80, h: 142, style: 'tower' },
  { id: 9, name: '中国银联中心', x: 65, z: -265, w: 112, d: 96, h: 190, style: 'union' },
  { id: 10, name: '中电科信息科技大厦', x: 205, z: -365, w: 86, d: 68, h: 146, style: 'tower' },
  { id: 11, name: '申能金融大厦', x: 325, z: -175, w: 88, d: 76, h: 165, style: 'tower' },
  { id: 12, name: '永诚大厦', x: 285, z: 55, w: 74, d: 68, h: 112, style: 'tower' },
  { id: 13, name: '航融盛通大厦', x: 365, z: 180, w: 88, d: 72, h: 128, style: 'tower' },
  { id: 14, name: '环博大厦', x: 235, z: 280, w: 82, d: 72, h: 124, style: 'tower' },
  { id: 15, name: '新开发银行总部大楼', x: 405, z: 410, w: 108, d: 86, h: 176, style: 'bank' },
  { id: 17, name: '浦银中心 A 座（北）', x: 110, z: 70, w: 84, d: 70, h: 88, style: 'lowrise', group: 'green' },
  { id: 18, name: '浦银中心 B 座', x: 135, z: 180, w: 82, d: 70, h: 82, style: 'lowrise', group: 'green' },
  { id: 19, name: '浦银中心 G 座', x: 5, z: 260, w: 80, d: 68, h: 75, style: 'lowrise', group: 'green' },
  { id: 20, name: '浦银中心 C 座', x: -115, z: 350, w: 82, d: 68, h: 79, style: 'lowrise', group: 'green' },
  { id: 21, name: '浦银中心 F 座', x: 55, z: 390, w: 76, d: 68, h: 77, style: 'lowrise', group: 'green' },
  { id: 22, name: '浦银中心 D 座', x: 185, z: 425, w: 80, d: 68, h: 81, style: 'lowrise', group: 'green' },
  { id: 23, name: '浦银中心 E 座', x: 280, z: 510, w: 82, d: 68, h: 73, style: 'lowrise', group: 'green' },
];

export const roads = [
  { name: '世博大道', kind: 'major', points: [[-760,-535],[760,-535]] },
  { name: '国展路', kind: 'major', points: [[-760,-350],[760,-350]] },
  { name: '博成路', kind: 'major', points: [[-760,-80],[760,-80]] },
  { name: '雪野路', kind: 'major', points: [[-760,180],[760,180]] },
  { name: '耀华路', kind: 'major', points: [[-760,590],[760,590]] },
  { name: '上南路', kind: 'major', points: [[-555,-650],[-555,700]] },
  { name: '白莲泾路', kind: 'major', points: [[560,-650],[560,700]] },
  { name: '世博馆路', kind: 'minor', points: [[-345,-510],[-345,560]] },
  { name: '周家渡路', kind: 'minor', points: [[25,-510],[25,560]] },
  { name: '谷亚路', kind: 'minor', points: [[350,-500],[350,560]] },
  { name: '雪野二路', kind: 'minor', points: [[-720,390],[720,390]] },
];

export const landmarks = {
  chinaMuseum: { name: '中华艺术宫（原中国馆）', x: -445, z: -105, w: 185, d: 170, h: 142 },
  expoCenter: { name: '上海世博展览馆', x: -135, z: -470, w: 180, d: 112, h: 26 },
  expoAxis: { name: '世博轴', x: -340, z: 65, w: 45, d: 255, h: 9 },
  cultureCenter: { name: '梅赛德斯-奔驰文化中心', x: -395, z: 360, w: 180, d: 145, h: 58 },
};
