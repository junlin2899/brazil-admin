// ============================
// 百川巴西货盘 - 后台管理服务器 (Railway 部署版)
// ============================

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// ---- Paths ----
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'products.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories
[DATA_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images
app.use('/uploads', express.static(UPLOADS_DIR));

// ---- Category & Platform config ----
const CATEGORIES = {
  beauty: '美妆护肤',
  daily: '日用百货',
  electronics: '3C数码',
  clothing: '服饰配件',
  sports: '运动户外',
  home: '家居家装',
  pet: '宠物用品'
};

const PLATFORMS = {
  ml: 'Mercado Libre',
  sh: 'Shopee Brasil',
  tk: 'TikTok Shop BR',
  az: 'Amazon Brasil'
};

// ---- Data helpers ----
function readProducts() {
  if (!fs.existsSync(DATA_FILE)) {
    const seed = generateSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeProducts(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getNextId(products) {
  if (products.length === 0) return 1;
  return Math.max(...products.map(p => p.id)) + 1;
}

function generateSeedData() {
  return [
    { id:1, name:'玻尿酸补水保湿面膜套装', category:'beauty', categoryName:'美妆护肤', price:28.50, moq:1, platform:'ml', platformName:'Mercado Libre', badge:'hot', badgeText:'热销', shortDesc:'深层补水，紧致肌肤，巴西热销美妆单品', fullDesc:'精选高纯度玻尿酸成分，搭配天然植物精华，深层补水锁水，有效改善肌肤干燥、暗沉问题。一套包含面膜贴20片 + 精华液30ml，适合所有肤质。巴西市场年销量超50万套，Mercado Libre 美妆类目TOP榜常驻单品。', specs:[{label:'规格',value:'面膜20片 + 精华液30ml'},{label:'适用肤质',value:'所有肤质'},{label:'产地',value:'中国广州'},{label:'发货地',value:'巴西圣保罗仓'},{label:'包装',value:'精装礼盒'},{label:'发货时效',value:'48小时内'}], features:['高纯度玻尿酸 + 三重植物精华','深层补水锁水，长效保湿12小时','轻薄透气膜布，贴合面部轮廓','无酒精、无香精，敏感肌友好','INMETRO 合规认证，顺利清关'], gradient:'linear-gradient(135deg, #fce4ec, #f8bbd0)', image:'' },
    { id:2, name:'天然植物精华卷翘睫毛膏', category:'beauty', categoryName:'美妆护肤', price:12.80, moq:1, platform:'sh', platformName:'Shopee Brasil', badge:'new', badgeText:'新品', shortDesc:'防水持久，不晕染，TikTok热推美妆爆款', fullDesc:'采用天然植物纤维刷头，精准捕捉每根睫毛，打造卷翘浓密效果。防水配方，15小时持妆不晕染，轻松卸妆不残留。', specs:[{label:'净含量',value:'8g'},{label:'颜色',value:'经典黑 / 深棕'},{label:'产地',value:'中国义乌'},{label:'发货地',value:'巴西圣保罗仓'},{label:'防水级别',value:'强防水'},{label:'发货时效',value:'48小时内'}], features:['天然植物纤维刷头，根根分明','防水防汗配方，15小时持久','温水可卸，无需专门卸妆液','TikTok 巴西站热推爆款','通过巴西 ANVISA 化妆品认证'], gradient:'linear-gradient(135deg, #e8eaf6, #c5cae9)', image:'' },
    { id:3, name:'多功能厨房收纳置物架', category:'daily', categoryName:'日用百货', price:35.00, moq:1, platform:'ml', platformName:'Mercado Libre', badge:'hot', badgeText:'热销', shortDesc:'304不锈钢材质，耐用防锈，巴西家居爆款', fullDesc:'选用食品级304不锈钢材质，三层结构设计，承重力强，防锈耐腐蚀。', specs:[{label:'材质',value:'304不锈钢'},{label:'尺寸',value:'40x25x50cm'},{label:'层数',value:'三层'},{label:'承重',value:'单层15kg'},{label:'产地',value:'中国永康'},{label:'发货时效',value:'48小时内'}], features:['食品级304不锈钢，不生锈不发霉','三层大容量收纳，分区合理','免打孔安装，稳固不晃动','圆角设计，安全防磕碰','INMETRO 材质认证，品质保障'], gradient:'linear-gradient(135deg, #e8f5e9, #c8e6c9)', image:'' },
    { id:4, name:'加厚防滑硅胶厨房隔热垫', category:'daily', categoryName:'日用百货', price:8.90, moq:1, platform:'sh', platformName:'Shopee Brasil', badge:'', badgeText:'', shortDesc:'食品级硅胶，耐高温200℃，套装6件实用', fullDesc:'食品级硅胶材质，耐高温200℃，蜂窝防滑纹理设计。', specs:[{label:'材质',value:'食品级硅胶'},{label:'耐温',value:'-40 ~ 200度'},{label:'套装',value:'6件套'},{label:'尺寸',value:'18x18cm/片'},{label:'发货地',value:'巴西圣保罗仓'},{label:'发货时效',value:'48小时内'}], features:['食品级硅胶，安全无毒无异味','耐高温200度，不变形不熔化','蜂窝纹理，防滑稳固有质感','6件套装，多场景任意搭配','可折叠收纳，小巧不占地'], gradient:'linear-gradient(135deg, #fff3e0, #ffe0b2)', image:'' },
    { id:5, name:'无线蓝牙耳机 TWS降噪', category:'electronics', categoryName:'3C数码', price:68.00, moq:1, platform:'ml', platformName:'Mercado Libre', badge:'hot', badgeText:'热销', shortDesc:'主动降噪，续航30h，巴西电商3C类目TOP', fullDesc:'蓝牙5.3芯片，支持ANC主动降噪，深度可达-35dB。', specs:[{label:'蓝牙版本',value:'5.3'},{label:'降噪',value:'ANC主动降噪 -35dB'},{label:'续航',value:'单耳8h / 总30h'},{label:'防水',value:'IPX5'},{label:'单元',value:'13mm大动圈'},{label:'发货时效',value:'48小时内'}], features:['ANC主动降噪','蓝牙5.3芯片，连接快、延迟低','Hi-Fi级13mm动圈，低音澎湃','IPX5防水防汗','ANATEL 巴西电信认证'], gradient:'linear-gradient(135deg, #e3f2fd, #bbdefb)', image:'' },
    { id:6, name:'20W快充充电宝 20000mAh', category:'electronics', categoryName:'3C数码', price:45.00, moq:1, platform:'sh', platformName:'Shopee Brasil', badge:'new', badgeText:'新品', shortDesc:'PD快充协议，双口输出，超薄轻便出行必备', fullDesc:'20000mAh 大容量，支持 PD 20W + QC 3.0 双快充协议。', specs:[{label:'容量',value:'20000mAh'},{label:'快充',value:'PD 20W + QC 3.0'},{label:'接口',value:'USB-A x2 + Type-C x1'},{label:'厚度',value:'1.2cm 超薄'},{label:'材质',value:'铝合金外壳'},{label:'发货时效',value:'48小时内'}], features:['20000mAh巨能充','PD 20W快充','三口同时输出','1.2cm超薄铝合金','ANATEL + INMETRO 双重认证'], gradient:'linear-gradient(135deg, #e0f7fa, #b2ebf2)', image:'' },
    { id:7, name:'运动健身瑜伽裤女高腰提臀', category:'clothing', categoryName:'服饰配件', price:22.00, moq:1, platform:'ml', platformName:'Mercado Libre', badge:'', badgeText:'', shortDesc:'蜜桃臀设计，弹力透气，巴西女装热销款', fullDesc:'高弹力氨纶+锦纶混纺面料，360度弹力拉伸。', specs:[{label:'材质',value:'80%锦纶 + 20%氨纶'},{label:'尺码',value:'S / M / L / XL'},{label:'颜色',value:'黑色 / 深灰 / 酒红 / 深蓝'},{label:'腰型',value:'高腰收腹'},{label:'产地',value:'中国汕头'},{label:'发货时效',value:'48小时内'}], features:['高弹力面料，360度自由拉伸','蜜桃臀立体剪裁，凸显好身形','速干透气，运动全程干爽','不透视设计，深蹲无忧','四针六线工艺，平整无线头'], gradient:'linear-gradient(135deg, #fce4ec, #f8bbd0)', image:'' },
    { id:8, name:'男士冰丝速干运动T恤', category:'clothing', categoryName:'服饰配件', price:16.50, moq:1, platform:'sh', platformName:'Shopee Brasil', badge:'hot', badgeText:'热销', shortDesc:'透气吸湿，抗UV，巴西夏季最热卖运动服', fullDesc:'冰丝凉感面料，接触凉感系数>0.2，一穿即凉。', specs:[{label:'材质',value:'冰丝凉感面料'},{label:'尺码',value:'S / M / L / XL / XXL'},{label:'颜色',value:'黑 / 白 / 灰 / 藏蓝'},{label:'防晒',value:'UPF50+'},{label:'产地',value:'中国杭州'},{label:'发货时效',value:'48小时内'}], features:['冰丝凉感，触肤即凉，夏季福音','UPF50+ 强防晒，户外不怕晒','速干排汗，15分钟快速干爽','修身版型，运动也有型','抗皱免烫，扔进行李箱就出发'], gradient:'linear-gradient(135deg, #e3f2fd, #bbdefb)', image:'' },
    { id:9, name:'TPE防滑加厚瑜伽垫 6mm', category:'sports', categoryName:'运动户外', price:42.00, moq:1, platform:'ml', platformName:'Mercado Libre', badge:'hot', badgeText:'热销', shortDesc:'环保材质，双面防滑，附背带方便携带', fullDesc:'TPE环保材质，无PVC、无甲醛，开箱即用无异味。', specs:[{label:'材质',value:'TPE环保材质'},{label:'厚度',value:'6mm'},{label:'尺寸',value:'183x61cm'},{label:'重量',value:'约1.2kg'},{label:'配件',value:'弹力背带 + 收纳袋'},{label:'发货时效',value:'48小时内'}], features:['TPE环保材质，开箱无异味','双面防滑波浪纹理，干湿两用','6mm加厚，膝盖手肘全保护','附赠背带收纳袋，出门就出发','INMETRO 安全认证，放心使用'], gradient:'linear-gradient(135deg, #e8f5e9, #c8e6c9)', image:'' },
    { id:10, name:'LED智能小夜灯感应灯', category:'home', categoryName:'家居家装', price:15.80, moq:1, platform:'ml', platformName:'Mercado Libre', badge:'new', badgeText:'新品', shortDesc:'人体感应，USB充电，温暖光色护眼护家', fullDesc:'红外人体感应 + 光感双模式，人来即亮、人走延时灭。', specs:[{label:'感应方式',value:'红外人体感应+光感'},{label:'光源',value:'LED无极调光'},{label:'色温',value:'3000K/4500K/6000K'},{label:'续航',value:'90天（感应模式）'},{label:'充电',value:'USB-C 充电'},{label:'发货时效',value:'48小时内'}], features:['智能感应，人来即亮、人走延时灭','三色温无极调光，场景随心切换','USB充电，90天超长续航','磁吸底座，随处安放不占空间','INMETRO 电子安全认证'], gradient:'linear-gradient(135deg, #fff9c4, #fff176)', image:'' },
    { id:11, name:'宠物自动饮水机循环过滤', category:'pet', categoryName:'宠物用品', price:38.00, moq:1, platform:'sh', platformName:'Shopee Brasil', badge:'', badgeText:'', shortDesc:'循环过滤，静音电机，猫犬通用2.5L大容量', fullDesc:'三重循环过滤系统，有效去除毛发、杂质、余氯。', specs:[{label:'容量',value:'2.5L'},{label:'过滤',value:'PP棉+活性炭+离子树脂'},{label:'噪音',value:'<30dB 超静音'},{label:'适用对象',value:'猫咪 / 小型犬'},{label:'材质',value:'食品级ABS'},{label:'发货时效',value:'48小时内'}], features:['三重深度过滤，每口水都干净','涌动活水设计，宠物更爱喝','超静音电机，<30dB不打扰','2.5L大容量，一周补给','易拆洗设计，清洁无死角'], gradient:'linear-gradient(135deg, #f3e5f5, #ce93d8)', image:'' },
    { id:12, name:'维C美白淡斑精华液30ml', category:'beauty', categoryName:'美妆护肤', price:19.90, moq:1, platform:'ml', platformName:'Mercado Libre', badge:'', badgeText:'', shortDesc:'高浓度VC，淡化色斑，提亮肤色，年销10W+', fullDesc:'10%高浓度VC衍生物（AA2G），温和不刺激。', specs:[{label:'净含量',value:'30ml'},{label:'核心成分',value:'10%VC + 烟酰胺 + 玻尿酸'},{label:'适用肤质',value:'所有肤质（敏感肌先测试）'},{label:'产地',value:'中国广州'},{label:'包装',value:'棕色避光瓶 + 滴管'},{label:'发货时效',value:'48小时内'}], features:['10%高浓度VC，温和不刺激','抑黑提亮，淡化已有色斑痘印','烟酰胺+透明质酸，美白又补水','滴管设计，精准控量不浪费','ANVISA 认证，巴西合法销售'], gradient:'linear-gradient(135deg, #fce4ec, #f1f8e9)', image:'' }
  ];
}

// ---- Multer config ----
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, UPLOADS_DIR); },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  }
});

// ============================
// API Routes
// ============================

app.get('/api/products', (req, res) => {
  try {
    let products = readProducts();
    const { category, platform, badge } = req.query;
    if (category && category !== 'all') products = products.filter(p => p.category === category);
    if (platform) products = products.filter(p => p.platform === platform);
    if (badge) products = products.filter(p => p.badge === badge);
    res.json({ success: true, data: products, total: products.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = readProducts().find(p => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).json({ success: false, message: '商品不存在' });
    res.json({ success: true, data: product });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/products', upload.single('image'), (req, res) => {
  try {
    const products = readProducts();
    const body = req.body;
    let specs = [], features = [];
    try { specs = JSON.parse(body.specs || '[]'); } catch (e) {}
    try { features = JSON.parse(body.features || '[]'); } catch (e) {}

    const newProduct = {
      id: getNextId(products),
      name: body.name || '', category: body.category || 'beauty',
      categoryName: CATEGORIES[body.category] || '',
      price: parseFloat(body.price) || 0, moq: parseInt(body.moq) || 1,
      platform: body.platform || 'ml', platformName: PLATFORMS[body.platform] || '',
      badge: body.badge || '',
      badgeText: body.badge === 'hot' ? '热销' : (body.badge === 'new' ? '新品' : ''),
      shortDesc: body.shortDesc || '', fullDesc: body.fullDesc || '',
      specs, features,
      gradient: body.gradient || 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
      image: req.file ? '/uploads/' + req.file.filename : ''
    };

    products.push(newProduct);
    writeProducts(products);
    res.json({ success: true, data: newProduct, message: '商品创建成功' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.put('/api/products/:id', upload.single('image'), (req, res) => {
  try {
    const products = readProducts();
    const idx = products.findIndex(p => p.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: '商品不存在' });

    const body = req.body;
    const old = products[idx];
    let specs = old.specs, features = old.features;
    try { if (body.specs) specs = JSON.parse(body.specs); } catch (e) {}
    try { if (body.features) features = JSON.parse(body.features); } catch (e) {}

    let image = old.image;
    if (req.file) {
      if (old.image && old.image.startsWith('/uploads/')) {
        const oldPath = path.join(UPLOADS_DIR, old.image.replace('/uploads/', ''));
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      image = '/uploads/' + req.file.filename;
    }

    products[idx] = {
      ...old,
      name: body.name !== undefined ? body.name : old.name,
      category: body.category !== undefined ? body.category : old.category,
      categoryName: body.category !== undefined ? (CATEGORIES[body.category] || old.categoryName) : old.categoryName,
      price: body.price !== undefined ? parseFloat(body.price) : old.price,
      moq: body.moq !== undefined ? parseInt(body.moq) : old.moq,
      platform: body.platform !== undefined ? body.platform : old.platform,
      platformName: body.platform !== undefined ? (PLATFORMS[body.platform] || old.platformName) : old.platformName,
      badge: body.badge !== undefined ? body.badge : old.badge,
      badgeText: body.badge === 'hot' ? '热销' : (body.badge === 'new' ? '新品' : (body.badge !== undefined ? '' : old.badgeText)),
      shortDesc: body.shortDesc !== undefined ? body.shortDesc : old.shortDesc,
      fullDesc: body.fullDesc !== undefined ? body.fullDesc : old.fullDesc,
      specs, features,
      gradient: body.gradient !== undefined ? body.gradient : old.gradient,
      image
    };

    writeProducts(products);
    res.json({ success: true, data: products[idx], message: '商品更新成功' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const products = readProducts();
    const idx = products.findIndex(p => p.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: '商品不存在' });
    const deleted = products[idx];
    if (deleted.image && deleted.image.startsWith('/uploads/')) {
      const imgPath = path.join(UPLOADS_DIR, deleted.image.replace('/uploads/', ''));
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    products.splice(idx, 1);
    writeProducts(products);
    res.json({ success: true, message: '商品已删除' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: '请选择图片文件' });
  res.json({ success: true, url: '/uploads/' + req.file.filename, message: '上传成功' });
});

app.get('/api/config', (req, res) => {
  res.json({ success: true, categories: CATEGORIES, platforms: PLATFORMS });
});

// ---- Serve static files & admin page ----
// Admin page at /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'admin.html'));
});

// All other static files
app.use(express.static(PUBLIC_DIR));

// SPA fallback: serve index.html for non-API, non-file routes
app.get('*', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ---- Start server ----
app.listen(PORT, () => {
  console.log('');
  console.log('  🚀 百川巴西货盘管理系统已启动');
  console.log('  ─────────────────────────────');
  console.log('  管理后台: http://localhost:' + PORT + '/admin');
  console.log('  前台网站: http://localhost:' + PORT);
  console.log('  API 地址: http://localhost:' + PORT + '/api/products');
  console.log('');
});
