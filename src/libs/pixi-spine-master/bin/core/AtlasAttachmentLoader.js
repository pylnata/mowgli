"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegionAttachment_1 = require("./attachments/RegionAttachment");
const MeshAttachment_1 = require("./attachments/MeshAttachment");
const BoundingBoxAttachment_1 = require("./attachments/BoundingBoxAttachment");
const PathAttachment_1 = require("./attachments/PathAttachment");
const PointAttachment_1 = require("./attachments/PointAttachment");
const ClippingAttachment_1 = require("./attachments/ClippingAttachment");
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
class AtlasAttachmentLoader {
    constructor(atlas) {
        this.atlas = atlas;
    }
    /** @return May be null to not load an attachment. */
    newRegionAttachment(skin, name, path) {
        let region = this.atlas.findRegion(path);
        if (region == null)
            throw new Error("Region not found in atlas: " + path + " (region attachment: " + name + ")");
        let attachment = new RegionAttachment_1.RegionAttachment(name);
        attachment.region = region;
        return attachment;
    }
    /** @return May be null to not load an attachment. */
    newMeshAttachment(skin, name, path) {
        let region = this.atlas.findRegion(path);
        if (region == null)
            throw new Error("Region not found in atlas: " + path + " (mesh attachment: " + name + ")");
        let attachment = new MeshAttachment_1.MeshAttachment(name);
        attachment.region = region;
        return attachment;
    }
    /** @return May be null to not load an attachment. */
    newBoundingBoxAttachment(skin, name) {
        return new BoundingBoxAttachment_1.BoundingBoxAttachment(name);
    }
    /** @return May be null to not load an attachment */
    newPathAttachment(skin, name) {
        return new PathAttachment_1.PathAttachment(name);
    }
    newPointAttachment(skin, name) {
        return new PointAttachment_1.PointAttachment(name);
    }
    newClippingAttachment(skin, name) {
        return new ClippingAttachment_1.ClippingAttachment(name);
    }
}
exports.AtlasAttachmentLoader = AtlasAttachmentLoader;
