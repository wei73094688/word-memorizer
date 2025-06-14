const fs = require('fs');
const path = require('path');

const wordsPath = path.join(__dirname, 'words.json');
const listPath = path.join(__dirname, 'list.json');

const words = JSON.parse(fs.readFileSync(wordsPath, 'utf-8'));
if (words.length < 50) {
  console.error('words.json 不足50条，当前仅有', words.length, '条。请补充后再生成list.json。');
  process.exit(1);
}
const list = words.slice(0, 50).map(({ id, word, meaning }) => ({ id, word, meaning }));

fs.writeFileSync(listPath, JSON.stringify(list, null, 2), 'utf-8');
console.log('list.json 已生成前50条单词。'); 