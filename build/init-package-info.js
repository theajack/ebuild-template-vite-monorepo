/*
 * @Author: chenzhongsheng
 * @Date: 2024-04-30 11:46:57
 * @Description: Coding something
 */
const { resolveRootPath, writeJsonIntoFile, resolvePackagePath } = require('./utils');

const isDev = process.argv[2] === 'dev';

initPackageInfo(isDev);

let version = process.argv[3];

if (version) {
    const path = resolveRootPath('package.json');
    const package = require(path);
    if (version[0] === 'v') version = version.substring(1);
    package.version = version;
    writeJsonIntoFile(package, path);
}

function initPackageInfo (isDev) {
    traverseDir(resolveRootPath('packages'), (dir) => {
        initSinglePackageInfo(dir, isDev);
    });
}

function initSinglePackageInfo (dir, isDev = false) {
    const packagePath = resolvePackagePath(`${dir}/package.json`);
    const package = require(packagePath);
    const packageName = buildPackageName(dir);

    if (isDev) {
        package.main = 'src/index.ts';
        package.typings = 'src/index.ts';
    } else {
        package.main = `dist/${packageName}.esm.js`;
        package.typings = `dist/${packageName}.d.ts`;
        package.unpkg = `dist/${packageName}.min.js`;
        package.jsdelivr = `dist/${packageName}.min.js`;
    }
    [ 'description', 'author', 'repository', 'license' ].forEach(name => {
        package[name] = rootPkg[name];
    });
    package.publishConfig = {
        registry: 'https://registry.npmjs.org/',
    };
    writeJsonIntoFile(package, packagePath);
    fs.copyFileSync(resolveRootPath('README.md'), resolvePackagePath(`${dir}/README.md`));
    fs.copyFileSync(resolveRootPath('LICENSE'), resolvePackagePath(`${dir}/LICENSE`));
    fs.copyFileSync(resolveRootPath('build/.npmignore'), resolvePackagePath(`${dir}/.npmignore`));

    // const tsconfig = require(resolveRootPath('tsconfig.json'));
    // tsconfig.include = [ 'src/**/*' ];
    // tsconfig.compilerOptions.rootDir = '../..';
    // writeJsonIntoFile(tsconfig, resolvePackagePath(`${dir}/tsconfig.json`));
}