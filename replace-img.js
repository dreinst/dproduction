const fs = require('fs');

const files = [
  'src/app/management/master/foto/page.tsx',
  'src/app/management/setting/head-home/page.tsx',
  'src/app/management/galeri/foto/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if next/image is already imported
    if (!content.includes('next/image')) {
      content = content.replace('import React', 'import Image from "next/image";\nimport React');
    }
    
    // Replace <img> with <Image>
    content = content.replace(/<img([^>]*)>/g, (match, p1) => {
      return `<Image width={500} height={500} ${p1}/>`;
    });
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
