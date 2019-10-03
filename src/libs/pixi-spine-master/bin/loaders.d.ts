import { LoaderResource, BaseTexture, Texture, Loader } from "pixi.js";
export declare class AtlasParser {
    static use(this: Loader, resource: LoaderResource, next: () => any): any;
}
export declare function imageLoaderAdapter(loader: any, namePrefix: any, baseUrl: any, imageOptions: any): (line: string, callback: (baseTexture: BaseTexture) => any) => void;
export declare function syncImageLoaderAdapter(baseUrl: any, crossOrigin: any): (line: any, callback: any) => void;
export declare function staticImageLoader(pages: {
    [key: string]: (BaseTexture | Texture);
}): (line: any, callback: any) => void;
