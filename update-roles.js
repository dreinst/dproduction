const fs = require('fs');
const path = require('path');

const group1 = ['workspace-reports', 'head-home'];
const group2 = [
  'clients', 'events', 'galeri-foto', 'galeri-foto-albums',
  'galeri-video', 'grade-events', 'jobdescs', 'rentals',
  'weddings', 'workspace-events'
];

function processFile(filePath, roles) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace import
  content = content.replace(
    /import\s*{\s*getUserFromToken\s*,\s*unauthorizedResponse\s*}\s*from\s*'@\/lib\/auth';/g,
    "import { requireRole } from '@/lib/auth';"
  );
  
  const replacement = `const { authorized, response } = await requireRole(${JSON.stringify(roles).replace(/"/g, "'")});\n  if (!authorized) return response;`;
  
  // Replace usages
  content = content.replace(
    /const\s+user\s*=\s*await\s+getUserFromToken\(\);\s*if\s*\(!user\)\s*return\s+unauthorizedResponse\(\);/g,
    replacement
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}`);
}

const basePath = path.join(__dirname, 'src', 'app', 'api');

group1.forEach(folder => {
  processFile(path.join(basePath, folder, 'route.ts'), ['owner', 'superadmin']);
  processFile(path.join(basePath, folder, '[id]', 'route.ts'), ['owner', 'superadmin']);
});

group2.forEach(folder => {
  processFile(path.join(basePath, folder, 'route.ts'), ['owner', 'superadmin', 'admin']);
  processFile(path.join(basePath, folder, '[id]', 'route.ts'), ['owner', 'superadmin', 'admin']);
});
