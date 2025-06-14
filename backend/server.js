const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

const cors = require('cors');

const allowlist = [
  'https://word-memorizer-9w5n-2nuc4o2oi-wei-weis-projects-4ca6bf47.vercel.app',
  'https://word-memorizer-9w5n-243w064bc-wei-weis-projects-4ca6bf47.vercel.app',
  // 以后有新域名直接加进来
];

const corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  if (allowlist.indexOf(req.header('Origin')) !== -1) {
    corsOptions = { origin: true, credentials: true, methods: ['GET','POST','PUT','DELETE','OPTIONS'] };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

app.use(cors(corsOptionsDelegate));

app.options('*', cors(corsOptionsDelegate));

app.use((req, res, next) => {
  console.log('实际请求Origin:', req.headers.origin);
  next();
});


app.use(express.json());
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
cookie: {
  secure: true, // 必须为 true，跨域时只有 https + secure 才能带 cookie
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'none' // 关键，允许跨域
}
}));

// 认证中间件：优先session，其次basic
const authenticate = (req, res, next) => {
  // 1. session认证
  if (req.session && req.session.user) {
    return next();
  }
  // 2. basic认证
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'user.json'), 'utf-8'));
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      req.session.user = { username };
      return next();
    }
  }
  res.status(401).json({ error: '未认证' });
};

// 登录接口（支持basic或表单）
app.post('/api/login', (req, res) => {
  let username, password;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Basic ')) {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    [username, password] = credentials.split(':');
  } else {
    username = req.body.username;
    password = req.body.password;
  }
  const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'user.json'), 'utf-8'));
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = { username, role: user.role };
    res.json({ success: true, role: user.role });
  } else {
    res.status(401).json({ error: '用户名或密码错误' });
  }
});

// 登出接口
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// 分页获取单词列表（查list.json）
app.get('/api/words', authenticate, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const words = JSON.parse(fs.readFileSync(path.join(__dirname, 'list.json'), 'utf-8'));
  const total = words.length;
  const start = (page - 1) * pageSize;
  const data = words.slice(start, start + pageSize);
  res.json({ data, total });
});

// 获取单词详情（查words.json）
app.get('/api/words/:id', authenticate, (req, res) => {
  const words = JSON.parse(fs.readFileSync(path.join(__dirname, 'words.json'), 'utf-8'));
  const id = parseInt(req.params.id);
  const word = words.find(w => w.id === id);
  if (word) {
    res.json({ data: word });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// 权限中间件
function requireRole(role) {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === role) {
      return next();
    }
    res.status(403).json({ error: '无权限' });
  };
}

// 删除单词
app.delete('/api/words/:id', authenticate, requireRole('admin'), (req, res) => {
  const id = parseInt(req.params.id);
  // list.json
  const listPath = path.join(__dirname, 'list.json');
  let wordsList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));
  const idx = wordsList.findIndex(w => w.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = wordsList.splice(idx, 1)[0];
  fs.writeFileSync(listPath, JSON.stringify(wordsList, null, 2));
  // words.json
  const wordsPath = path.join(__dirname, 'words.json');
  let wordsDetail = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  const idx2 = wordsDetail.findIndex(w => w.id === id);
  if (idx2 !== -1) {
    wordsDetail.splice(idx2, 1);
    fs.writeFileSync(wordsPath, JSON.stringify(wordsDetail, null, 2));
  }
  res.json({ data: deleted });
});

// 新增单词
app.post('/api/words', authenticate, requireRole('admin'), (req, res) => {
  const { word, meaning, phonetic, example } = req.body;
  if (!word || !meaning) {
    return res.status(400).json({ error: '缺少参数' });
  }
  // 读取现有id，确保唯一
  const listPath = path.join(__dirname, 'list.json');
  const wordsPath = path.join(__dirname, 'words.json');
  const wordsList = JSON.parse(fs.readFileSync(listPath, 'utf-8'));
  const wordsDetail = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
  const allIds = [...wordsList.map(w => w.id), ...wordsDetail.map(w => w.id)];
  let id = 1;
  while (allIds.includes(id)) id++;
  // 写入list.json
  const newListWord = { id, word, meaning };
  wordsList.push(newListWord);
  fs.writeFileSync(listPath, JSON.stringify(wordsList, null, 2));
  // 写入words.json
  const newDetailWord = { id, word, meaning, phonetic: phonetic || '', example: example || '' };
  wordsDetail.push(newDetailWord);
  fs.writeFileSync(wordsPath, JSON.stringify(wordsDetail, null, 2));
  res.json({ data: newDetailWord });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});




