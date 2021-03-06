"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixi_js_1 = require("pixi.js");
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
class Texture {
    constructor(image) {
        this._image = image;
    }
    getImage() {
        return this._image;
    }
    static filterFromString(text) {
        switch (text.toLowerCase()) {
            case "nearest": return TextureFilter.Nearest;
            case "linear": return TextureFilter.Linear;
            case "mipmap": return TextureFilter.MipMap;
            case "mipmapnearestnearest": return TextureFilter.MipMapNearestNearest;
            case "mipmaplinearnearest": return TextureFilter.MipMapLinearNearest;
            case "mipmapnearestlinear": return TextureFilter.MipMapNearestLinear;
            case "mipmaplinearlinear": return TextureFilter.MipMapLinearLinear;
            default: throw new Error(`Unknown texture filter ${text}`);
        }
    }
    static wrapFromString(text) {
        switch (text.toLowerCase()) {
            case "mirroredtepeat": return TextureWrap.MirroredRepeat;
            case "clamptoedge": return TextureWrap.ClampToEdge;
            case "repeat": return TextureWrap.Repeat;
            default: throw new Error(`Unknown texture wrap ${text}`);
        }
    }
}
exports.Texture = Texture;
var TextureFilter;
(function (TextureFilter) {
    TextureFilter[TextureFilter["Nearest"] = 9728] = "Nearest";
    TextureFilter[TextureFilter["Linear"] = 9729] = "Linear";
    TextureFilter[TextureFilter["MipMap"] = 9987] = "MipMap";
    TextureFilter[TextureFilter["MipMapNearestNearest"] = 9984] = "MipMapNearestNearest";
    TextureFilter[TextureFilter["MipMapLinearNearest"] = 9985] = "MipMapLinearNearest";
    TextureFilter[TextureFilter["MipMapNearestLinear"] = 9986] = "MipMapNearestLinear";
    TextureFilter[TextureFilter["MipMapLinearLinear"] = 9987] = "MipMapLinearLinear"; // WebGLRenderingContext.LINEAR_MIPMAP_LINEAR
})(TextureFilter = exports.TextureFilter || (exports.TextureFilter = {}));
var TextureWrap;
(function (TextureWrap) {
    TextureWrap[TextureWrap["MirroredRepeat"] = 33648] = "MirroredRepeat";
    TextureWrap[TextureWrap["ClampToEdge"] = 33071] = "ClampToEdge";
    TextureWrap[TextureWrap["Repeat"] = 10497] = "Repeat"; // WebGLRenderingContext.REPEAT
})(TextureWrap = exports.TextureWrap || (exports.TextureWrap = {}));
class TextureRegion {
    constructor() {
        //thats for overrides
        this.size = null;
    }
    get width() {
        const tex = this.texture;
        if (pixi_js_1.VERSION[0] == '3') {
            return tex.crop.width;
        }
        if (tex.trim) {
            return tex.trim.width;
        }
        return tex.orig.width;
    }
    get height() {
        const tex = this.texture;
        if (pixi_js_1.VERSION[0] == '3') {
            return tex.crop.height;
        }
        if (tex.trim) {
            return tex.trim.height;
        }
        return tex.orig.height;
    }
    get u() {
        return this.texture._uvs.x0;
    }
    get v() {
        return this.texture._uvs.y0;
    }
    get u2() {
        return this.texture._uvs.x2;
    }
    get v2() {
        return this.texture._uvs.y2;
    }
    get offsetX() {
        const tex = this.texture;
        return tex.trim ? tex.trim.x : 0;
    }
    get offsetY() {
        console.warn("Deprecation Warning: @Hackerham: I guess, if you are using PIXI-SPINE ATLAS region.offsetY, you want a texture, right? Use region.texture from now on.");
        return this.spineOffsetY;
    }
    get pixiOffsetY() {
        const tex = this.texture;
        return tex.trim ? tex.trim.y : 0;
    }
    get spineOffsetY() {
        let tex = this.texture;
        return this.originalHeight - this.height - (tex.trim ? tex.trim.y : 0);
    }
    get originalWidth() {
        let tex = this.texture;
        if (pixi_js_1.VERSION[0] == '3') {
            if (tex.trim) {
                return tex.trim.width;
            }
            return tex.crop.width;
        }
        return tex.orig.width;
    }
    get originalHeight() {
        const tex = this.texture;
        if (pixi_js_1.VERSION[0] == '3') {
            if (tex.trim) {
                return tex.trim.height;
            }
            return tex.crop.height;
        }
        return tex.orig.height;
    }
    get x() {
        return this.texture.frame.x;
    }
    get y() {
        return this.texture.frame.y;
    }
    get rotate() {
        return this.texture.rotate !== 0;
    }
}
exports.TextureRegion = TextureRegion;
