"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Attachment_1 = require("./Attachment");
const Utils_1 = require("../Utils");
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
class MeshAttachment extends Attachment_1.VertexAttachment {
    constructor(name) {
        super(name);
        this.color = new Utils_1.Color(1, 1, 1, 1);
        this.inheritDeform = false;
        this.tempColor = new Utils_1.Color(0, 0, 0, 0);
    }
    updateUVs(region, uvs) {
        let regionUVs = this.regionUVs;
        let n = regionUVs.length;
        if (!uvs || uvs.length != n) {
            uvs = Utils_1.Utils.newFloatArray(n);
        }
        if (region == null) {
            return;
        }
        let texture = region.texture;
        let r = texture._uvs;
        let w1 = region.width, h1 = region.height, w2 = region.originalWidth, h2 = region.originalHeight;
        let x = region.offsetX, y = region.pixiOffsetY;
        for (let i = 0; i < n; i += 2) {
            let u = this.regionUVs[i], v = this.regionUVs[i + 1];
            u = (u * w2 - x) / w1;
            v = (v * h2 - y) / h1;
            uvs[i] = (r.x0 * (1 - u) + r.x1 * u) * (1 - v) + (r.x3 * (1 - u) + r.x2 * u) * v;
            uvs[i + 1] = (r.y0 * (1 - u) + r.y1 * u) * (1 - v) + (r.y3 * (1 - u) + r.y2 * u) * v;
        }
        return uvs;
    }
    applyDeform(sourceAttachment) {
        return this == sourceAttachment || (this.inheritDeform && this.parentMesh == sourceAttachment);
    }
    getParentMesh() {
        return this.parentMesh;
    }
    /** @param parentMesh May be null. */
    setParentMesh(parentMesh) {
        this.parentMesh = parentMesh;
        if (parentMesh != null) {
            this.bones = parentMesh.bones;
            this.vertices = parentMesh.vertices;
            this.worldVerticesLength = parentMesh.worldVerticesLength;
            this.regionUVs = parentMesh.regionUVs;
            this.triangles = parentMesh.triangles;
            this.hullLength = parentMesh.hullLength;
            this.worldVerticesLength = parentMesh.worldVerticesLength;
        }
    }
}
exports.MeshAttachment = MeshAttachment;
