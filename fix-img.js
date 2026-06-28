const fs = require('fs');

const files = [
  'src/app/management/master/foto/page.tsx',
  'src/app/management/setting/head-home/page.tsx',
  'src/app/management/galeri/foto/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix the double slash
    content = content.replace(/\/\/>/g, '/>');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
