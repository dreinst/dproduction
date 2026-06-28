const fs = require('fs');
const path = require('path');

const models = ['Event', 'Wedding', 'WorkspaceSalary', 'WorkspaceEvent', 'Client'];
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

models.forEach(model => {
  const modelRegex = new RegExp(`(model\\s+${model}\\s+{[^}]*?createdAt\\s+DateTime\\s+@default\\(now\\(\\)\\))`, 'g');
  content = content.replace(modelRegex, `$1\n  deletedAt DateTime?`);
});

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Added deletedAt to models.');
