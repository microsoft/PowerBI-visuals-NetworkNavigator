/// <reference path="../power-bi/src/Clients/Typedefs/microsoftMaps/Microsoft.Maps.d.ts"/>
/// <reference path="../power-bi/src/Clients/Typedefs/quill/quill.d.ts"/>
/// <reference path="../power-bi/lib/powerbi-externals.d.ts"/>
/// <reference path="../power-bi/lib/powerbi-visuals.d.ts"/>
declare var _;

/**
 * Necessary to pull in scss resources
 */
declare var require: {
    (path: string): any;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};