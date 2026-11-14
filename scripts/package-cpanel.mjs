import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
execFileSync('npm',['run','build'],{stdio:'inherit',env:{...process.env,VITE_APP_MODE:'connected'}});
const root='.deploy/cpanel'; rmSync(root,{recursive:true,force:true}); mkdirSync(root,{recursive:true});
cpSync('dist',`${root}/public_html`,{recursive:true}); cpSync('backend',`${root}/vira-private`,{recursive:true});
cpSync('docs/CPANEL.fa.md',`${root}/INSTALL.fa.md`);
writeFileSync(`${root}/vira-private/.htaccess`,'Require all denied\n');
execFileSync('python3',['-c',`import shutil; shutil.make_archive('vira-cpanel-connected','zip','${root}')`],{stdio:'inherit'});
console.log('Created vira-cpanel-connected.zip (configure and install before use)');
