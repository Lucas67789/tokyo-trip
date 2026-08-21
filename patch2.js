const fs = require('fs');
const path = require('path');
const dir = 'C:/Tokyo/src/app/actions';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/if \(!user\)/g, 'if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL))');
  
  fs.writeFileSync(filePath, content);
});

let middleware = fs.readFileSync('C:/Tokyo/src/middleware.ts', 'utf8');
middleware = middleware.replace(/if \(!user\)/g, 'if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL))');
fs.writeFileSync('C:/Tokyo/src/middleware.ts', middleware);

// Wait, I need to check admin/layout.tsx and admin/page.tsx etc?
// Usually, admin pages are protected by middleware, so patching middleware is enough for UI.
// Let's also patch admin pages just in case.

const adminDir = 'C:/Tokyo/src/app/admin';
function patchAdminPages(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      patchAdminPages(fullPath);
    } else if (item === 'page.tsx' || item === 'layout.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('if (!user)')) {
        content = content.replace(/if \(!user\)/g, 'if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL))');
        fs.writeFileSync(fullPath, content);
      }
    }
  });
}
patchAdminPages(adminDir);
console.log('Patched all.');
