'use strict';

function findDirectoryPathInModule(directory, moduleDir, moduleId) {
    let moduleDirName;
    //We want to be able to use __dirname when creating the subapp
    if (moduleDir && path.isAbsolute(moduleDir)) {
        moduleDirName = moduleDir;
    } else {
        //TODO: Use context.loaders.modules
        const modules = path.resolve('./modules');
        moduleDirName = path.join(modules, moduleId);
    }

    //TODO: Handle paths at application-core. As it is, we are 
    //guessing the user started the app from the ./src directory
    return path.join(moduleDirName, directory);
}

module.exports.findDirectoryPathInModule = findDirectoryPathInModule;