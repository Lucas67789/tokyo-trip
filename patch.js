const fs = require('fs');
const path = require('path');
const dir = 'C:/Tokyo/src/app/actions';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace single line checks
  content = content.replace(/if \(!user\) throw new Error\(([^)]+)\);?/g, 'if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) throw new Error();');
  
  // Replace block checks
  content = content.replace(/if \(!user\) \{\s*throw new Error\(([^)]+)\);?\s*\}/g, 'if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) {\n    throw new Error();\n  }');
  
  fs.writeFileSync(filePath, content);
});

// Also patch middleware.ts
let middleware = fs.readFileSync('C:/Tokyo/src/middleware.ts', 'utf8');
middleware = middleware.replace(/if \(!user\)/g, 'if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL))');
fs.writeFileSync('C:/Tokyo/src/middleware.ts', middleware);

console.log('Patched all actions and middleware');
