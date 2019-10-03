import { Texture as PixiTexture, Rectangle } from "pixi.js";
/******************************************************************************
 * Spine Runtimes Software License
 * Version 2.5
 *
 * Copyright (c) 2013-2016, Esoteric Software
 * All rights reserved.
 *
 * You are granted a perpetual, non-exclusive, non-sublicensable, and
 * non-transferable license to use, install, execute, and perform the Spine
 * Runtimes software and derivative works solely for personal or internal
 * use. Without the written permission of Esoteric Software (see Section 2 of
 * the Spine Software License Agreement), you may not (a) modify, translate,
 * adapt, or develop new applications using the Spine Runtimes or otherwise
 * create derivative works or improvements of the Spine Runtimes or (b) remove,
 * delete, alter, or obscure any trademarks or any copyright, trademark, patent,
 * or other intellectual property or proprietary rights notices on or in the
 * Software, including any copy thereof. Redistributions in binary or source
 * form must include this license and terms.
 *
 * THIS SOFTWARE IS PROVIDED BY ESOTERIC SOFTWARE "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL ESOTERIC SOFTWARE BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, BUSINESS INTERRUPTION, OR LOSS OF
 * USE, DATA, OR PROFITS) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/
export declare abstract class Texture {
    protected _image: HTMLImageElement;
    constructor(image: HTMLImageElement);
    getImage(): HTMLImageElement;
    abstract setFilters(minFilter: TextureFilter, magFilter: TextureFilter): void;
    abstract setWraps(uWrap: TextureWrap, vWrap: TextureWrap): void;
    abstract dispose(): void;
    static filterFromString(text: string): TextureFilter;
    static wrapFromString(text: string): TextureWrap;
}
export declare enum TextureFilter {
    Nearest = 9728,
    Linear = 9729,
    MipMap = 9987,
    MipMapNearestNearest = 9984,
    MipMapLinearNearest = 9985,
    MipMapNearestLinear = 9986,
    MipMapLinearLinear = 9987
}
export declare enum TextureWrap {
    MirroredRepeat = 33648,
    ClampToEdge = 33071,
    Repeat = 10497
}
export declare class TextureRegion {
    texture: PixiTexture;
    size: Rectangle;
    readonly width: number;
    readonly height: number;
    readonly u: number;
    readonly v: number;
    readonly u2: number;
    readonly v2: number;
    readonly offsetX: number;
    readonly offsetY: number;
    readonly pixiOffsetY: number;
    readonly spineOffsetY: number;
    readonly originalWidth: number;
    readonly originalHeight: number;
    readonly x: number;
    readonly y: number;
    readonly rotate: boolean;
}
