const fs = require('fs');
const path = require('path');

const targets = [
  { folder: 'events', model: 'event' },
  { folder: 'weddings', model: 'wedding' },
  { folder: 'workspace-salary', model: 'workspaceSalary' },
  { folder: 'workspace-events', model: 'workspaceEvent' },
  { folder: 'clients', model: 'client' },
];

const basePath = path.join(__dirname, 'src', 'app', 'api');

targets.forEach(({ folder, model }) => {
  const routePath = path.join(basePath, folder, 'route.ts');
  const idRoutePath = path.join(basePath, folder, '[id]', 'route.ts');
  
  // Update GET in route.ts
  if (fs.existsSync(routePath)) {
    let content = fs.readFileSync(routePath, 'utf8');
    
    // Add where: { deletedAt: null }
    content = content.replace(
      new RegExp(`(prisma\\.${model}\\.findMany\\(\\{[\\s\\S]*?)(orderBy:)`, 'g'),
      `$1where: { deletedAt: null },\n      $2`
    );
    
    fs.writeFileSync(routePath, content, 'utf8');
    console.log(`Updated GET in ${folder}/route.ts`);
  }
  
  // Update DELETE and GET in [id]/route.ts
  if (fs.existsSync(idRoutePath)) {
    let content = fs.readFileSync(idRoutePath, 'utf8');
    
    // Update GET to ignore soft deleted
    // Usually it's prisma.model.findUnique({ where: { id } })
    // If we use findUnique, we can't filter by deletedAt: null easily because where needs unique constraint.
    // So we change findUnique to findFirst({ where: { id, deletedAt: null } })
    content = content.replace(
      new RegExp(`prisma\\.${model}\\.findUnique\\(\\{[\\s\\n]*where:\\s*\\{\\s*id\\s*\\},?[\\s\\n]*\\}\\);`, 'g'),
      `prisma.${model}.findFirst({\n      where: { id, deletedAt: null },\n    });`
    );
    
    // Update DELETE
    content = content.replace(
      new RegExp(`await\\s+prisma\\.${model}\\.delete\\(\\{[\\s\\n]*where:\\s*\\{\\s*id\\s*\\},?[\\s\\n]*\\}\\);`, 'g'),
      `await prisma.${model}.update({\n      where: { id },\n      data: { deletedAt: new Date() },\n    });`
    );
    
    fs.writeFileSync(idRoutePath, content, 'utf8');
    console.log(`Updated GET & DELETE in ${folder}/[id]/route.ts`);
  }
});
