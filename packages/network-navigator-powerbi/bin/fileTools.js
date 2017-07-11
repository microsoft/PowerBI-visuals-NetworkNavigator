/**
 * Copyright (c) 2016 Uncharted Software Inc.
 * http://www.uncharted.software/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */


const fs = require('fs');
const path = require('path');

const fileTools = {
    /**
     * Checks is a file (or a folder) exists at the given path.
     *
     * @method pathExists
     * @param {String} filePath - The path to the file to check.
     * @returns {boolean}
     */
    pathExists: function(filePath) {
        try {
            fs.accessSync(filePath, fs.F_OK);
            return true;
        } catch (err) {}
        return false;
    },

    /**
     * Iterates through the contents of the specified folder and invokes the callback `onEntry` for every entry found.
     *
     * @method findEntriesInFolder
     * @param {String} folder - The path to the folder to iterate.
     * @param {Function} onEntry - A callback with signature (entryPath, entryName) => {}
     */
    findEntriesInFolder: function(folder, onEntry) {
        if(onEntry && fileTools.pathExists(folder) && fs.lstatSync(folder).isDirectory()) {
            fs.readdirSync(folder).forEach(entry => {
                onEntry(path.join(folder, entry), entry);
            });
        }
    },

    /**
     * Deletes a folder, its files and folders recursively.
     *
     * @method deleteFolder
     * @param {String} folderPath - The path to the folder to delete.
     */
    deleteFolder: function(folderPath) {
        if(fileTools.pathExists(folderPath)) {
            fileTools.findEntriesInFolder(folderPath, entry => {
                if(fs.lstatSync(entry).isDirectory()) { // recurse
                    fileTools.deleteFolder(entry);
                } else { // delete file
                    fs.unlinkSync(entry);
                }
            });
            fs.rmdirSync(folderPath);
        }
    },

    /**
     * Creates the folder structure specified in the provided path.
     *
     * @method createFilePath
     * @param {String} filePath - The path to create.
     */
    createFilePath: function(filePath) {
        const folderPath = path.dirname(filePath);
        if (!fileTools.pathExists(folderPath)) {
            fileTools.createFilePath(folderPath);
            fs.mkdirSync(folderPath);
        }
    }
};

module.exports = fileTools;
