"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TextureAtlas_1 = require("./core/TextureAtlas");
const SkeletonJson_1 = require("./core/SkeletonJson");
const AtlasAttachmentLoader_1 = require("./core/AtlasAttachmentLoader");
const pixi_js_1 = require("pixi.js");
function isJson(resource) {
    return resource.type === pixi_js_1.LoaderResource.TYPE.JSON;
}
class AtlasParser {
    static use(resource, next) {
        // skip if no data, its not json, or it isn't atlas data
        if (!resource.data ||
            !isJson(resource) ||
            !resource.data.bones) {
            return next();
        }
        const metadata = resource.metadata || {};
        const metadataSkeletonScale = metadata ? resource.metadata.spineSkeletonScale : null;
        const metadataAtlas = metadata ? resource.metadata.spineAtlas : null;
        if (metadataAtlas === false) {
            return next();
        }
        if (metadataAtlas && metadataAtlas.pages) {
            //its an atlas!
            const spineJsonParser = new SkeletonJson_1.SkeletonJson(new AtlasAttachmentLoader_1.AtlasAttachmentLoader(metadataAtlas));
            if (metadataSkeletonScale) {
                spineJsonParser.scale = metadataSkeletonScale;
            }
            const skeletonData = spineJsonParser.readSkeletonData(resource.data);
            resource.spineData = skeletonData;
            resource.spineAtlas = metadataAtlas;
            return next();
        }
        const metadataAtlasSuffix = metadata.spineAtlasSuffix || '.atlas';
        /**
         * use a bit of hackery to load the atlas file, here we assume that the .json, .atlas and .png files
         * that correspond to the spine file are in the same base URL and that the .json and .atlas files
         * have the same name
         */
        let atlasPath = resource.url;
        let queryStringPos = atlasPath.indexOf('?');
        if (queryStringPos > 0) {
            //remove querystring
            atlasPath = atlasPath.substr(0, queryStringPos);
        }
        atlasPath = atlasPath.substr(0, atlasPath.lastIndexOf('.')) + metadataAtlasSuffix;
        // use atlas path as a params. (no need to use same atlas file name with json file name)
        if (resource.metadata && resource.metadata.spineAtlasFile) {
            atlasPath = resource.metadata.spineAtlasFile;
        }
        //remove the baseUrl
        atlasPath = atlasPath.replace(this.baseUrl, '');
        const atlasOptions = {
            crossOrigin: resource.crossOrigin,
            xhrType: pixi_js_1.LoaderResource.XHR_RESPONSE_TYPE.TEXT,
            metadata: metadata.spineMetadata || null,
            parentResource: resource
        };
        const imageOptions = {
            crossOrigin: resource.crossOrigin,
            metadata: metadata.imageMetadata || null,
            parentResource: resource
        };
        let baseUrl = resource.url.substr(0, resource.url.lastIndexOf('/') + 1);
        //remove the baseUrl
        baseUrl = baseUrl.replace(this.baseUrl, '');
        const namePrefix = metadata.imageNamePrefix || (resource.name + '_atlas_page_');
        const adapter = metadata.images ? staticImageLoader(metadata.images)
            : metadata.image ? staticImageLoader({ 'default': metadata.image })
                : metadata.imageLoader ? metadata.imageLoader(this, namePrefix, baseUrl, imageOptions)
                    : imageLoaderAdapter(this, namePrefix, baseUrl, imageOptions);
        const createSkeletonWithRawAtlas = function (rawData) {
            new TextureAtlas_1.TextureAtlas(rawData, adapter, function (spineAtlas) {
                if (spineAtlas) {
                    const spineJsonParser = new SkeletonJson_1.SkeletonJson(new AtlasAttachmentLoader_1.AtlasAttachmentLoader(spineAtlas));
                    if (metadataSkeletonScale) {
                        spineJsonParser.scale = metadataSkeletonScale;
                    }
                    resource.spineData = spineJsonParser.readSkeletonData(resource.data);
                    resource.spineAtlas = spineAtlas;
                }
                next();
            });
        };
        if (resource.metadata && resource.metadata.atlasRawData) {
            createSkeletonWithRawAtlas(resource.metadata.atlasRawData);
        }
        else {
            this.add(resource.name + '_atlas', atlasPath, atlasOptions, function (atlasResource) {
                if (!atlasResource.error) {
                    createSkeletonWithRawAtlas(atlasResource.data);
                }
                else {
                    next();
                }
            });
        }
    }
}
exports.AtlasParser = AtlasParser;
function imageLoaderAdapter(loader, namePrefix, baseUrl, imageOptions) {
    if (baseUrl && baseUrl.lastIndexOf('/') !== (baseUrl.length - 1)) {
        baseUrl += '/';
    }
    return function (line, callback) {
        const name = namePrefix + line;
        const url = baseUrl + line;
        const cachedResource = loader.resources[name];
        if (cachedResource) {
            const done = () => {
                callback(cachedResource.texture.baseTexture);
            };
            if (cachedResource.texture) {
                done();
            }
            else {
                cachedResource.onAfterMiddleware.add(done);
            }
        }
        else {
            loader.add(name, url, imageOptions, (resource) => {
                if (!resource.error) {
                    callback(resource.texture.baseTexture);
                }
                else {
                    callback(null);
                }
            });
        }
    };
}
exports.imageLoaderAdapter = imageLoaderAdapter;
function syncImageLoaderAdapter(baseUrl, crossOrigin) {
    if (baseUrl && baseUrl.lastIndexOf('/') !== (baseUrl.length - 1)) {
        baseUrl += '/';
    }
    return function (line, callback) {
        callback(pixi_js_1.BaseTexture.from(line, crossOrigin));
    };
}
exports.syncImageLoaderAdapter = syncImageLoaderAdapter;
function staticImageLoader(pages) {
    return function (line, callback) {
        let page = pages[line] || pages['default'];
        if (page && page.baseTexture)
            callback(page.baseTexture);
        else
            callback(page);
    };
}
exports.staticImageLoader = staticImageLoader;
if (pixi_js_1.Loader) {
    pixi_js_1.Loader.registerPlugin(AtlasParser);
}
