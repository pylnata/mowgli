"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pixi_js_1 = require("pixi.js");
const Bone_1 = require("./core/Bone");
const Texture_1 = require("./core/Texture");
const Skeleton_1 = require("./core/Skeleton");
const AnimationStateData_1 = require("./core/AnimationStateData");
const AnimationState_1 = require("./core/AnimationState");
const RegionAttachment_1 = require("./core/attachments/RegionAttachment");
const MeshAttachment_1 = require("./core/attachments/MeshAttachment");
const ClippingAttachment_1 = require("./core/attachments/ClippingAttachment");
const Utils_1 = require("./core/Utils");
require("./loaders");
require("./polyfills");
/* Esoteric Software SPINE wrapper for pixi.js */
Bone_1.Bone.yDown = true;
let tempRgb = [0, 0, 0];
var loaders_1 = require("./loaders");
exports.AtlasParser = loaders_1.AtlasParser;
class SpineSprite extends pixi_js_1.Sprite {
    constructor() {
        super(...arguments);
        this.region = null;
    }
}
exports.SpineSprite = SpineSprite;
class SpineMesh extends pixi_js_1.SimpleMesh {
    constructor(texture, vertices, uvs, indices, drawMode) {
        super(texture, vertices, uvs, indices, drawMode);
    }
}
exports.SpineMesh = SpineMesh;
/**
 * A class that enables the you to import and run your spine animations in pixi.
 * The Spine animation data needs to be loaded using either the Loader or a SpineLoader before it can be used by this class
 * See example 12 (http://www.goodboydigital.com/pixijs/examples/12/) to see a working example and check out the source
 *
 * ```js
 * let spineAnimation = new spine(spineData);
 * ```
 *
 * @class
 * @extends Container
 * @memberof spine
 * @param spineData {object} The spine data loaded from a spine atlas.
 */
class Spine extends pixi_js_1.Container {
    constructor(spineData) {
        super();
        if (!spineData) {
            throw new Error('The spineData param is required.');
        }
        if ((typeof spineData) === "string") {
            throw new Error('spineData param cant be string. Please use spine.Spine.fromAtlas("YOUR_RESOURCE_NAME") from now on.');
        }
        /**
         * The spineData object
         *
         * @member {object}
         */
        this.spineData = spineData;
        /**
         * A spine Skeleton object
         *
         * @member {object}
         */
        this.skeleton = new Skeleton_1.Skeleton(spineData);
        this.skeleton.updateWorldTransform();
        /**
         * A spine AnimationStateData object created from the spine data passed in the constructor
         *
         * @member {object}
         */
        this.stateData = new AnimationStateData_1.AnimationStateData(spineData);
        /**
         * A spine AnimationState object created from the spine AnimationStateData object
         *
         * @member {object}
         */
        this.state = new AnimationState_1.AnimationState(this.stateData);
        /**
         * An array of containers
         *
         * @member {Container[]}
         */
        this.slotContainers = [];
        this.tempClipContainers = [];
        for (let i = 0, n = this.skeleton.slots.length; i < n; i++) {
            let slot = this.skeleton.slots[i];
            let attachment = slot.attachment;
            let slotContainer = this.newContainer();
            this.slotContainers.push(slotContainer);
            this.addChild(slotContainer);
            this.tempClipContainers.push(null);
            if (attachment instanceof RegionAttachment_1.RegionAttachment) {
                let spriteName = attachment.region.name;
                let sprite = this.createSprite(slot, attachment, spriteName);
                slot.currentSprite = sprite;
                slot.currentSpriteName = spriteName;
                slotContainer.addChild(sprite);
            }
            else if (attachment instanceof MeshAttachment_1.MeshAttachment) {
                let mesh = this.createMesh(slot, attachment);
                slot.currentMesh = mesh;
                slot.currentMeshName = attachment.name;
                slotContainer.addChild(mesh);
            }
            else if (attachment instanceof ClippingAttachment_1.ClippingAttachment) {
                this.createGraphics(slot, attachment);
                slotContainer.addChild(slot.clippingContainer);
                slotContainer.addChild(slot.currentGraphics);
            }
            else {
                continue;
            }
        }
        /**
         * Should the Spine object update its transforms
         *
         * @member {boolean}
         */
        this.autoUpdate = true;
        /**
         * The tint applied to all spine slots. This is a [r,g,b] value. A value of [1,1,1] will remove any tint effect.
         *
         * @member {number}
         * @memberof spine.Spine#
         */
        this.tintRgb = new Float32Array([1, 1, 1]);
    }
    /**
     * If this flag is set to true, the spine animation will be autoupdated every time
     * the object id drawn. The down side of this approach is that the delta time is
     * automatically calculated and you could miss out on cool effects like slow motion,
     * pause, skip ahead and the sorts. Most of these effects can be achieved even with
     * autoupdate enabled but are harder to achieve.
     *
     * @member {boolean}
     * @memberof spine.Spine#
     * @default true
     */
    get autoUpdate() {
        return (this.updateTransform === Spine.prototype.autoUpdateTransform);
    }
    set autoUpdate(value) {
        this.updateTransform = value ? Spine.prototype.autoUpdateTransform : pixi_js_1.Container.prototype.updateTransform;
    }
    /**
     * The tint applied to the spine object. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @memberof spine.Spine#
     * @default 0xFFFFFF
     */
    get tint() {
        return pixi_js_1.utils.rgb2hex(this.tintRgb);
    }
    set tint(value) {
        this.tintRgb = pixi_js_1.utils.hex2rgb(value, this.tintRgb);
    }
    /**
     * Limit value for the update dt with Spine.globalDelayLimit
     * that can be overridden with localDelayLimit
     * @return {number} - Maximum processed dt value for the update
     */
    get delayLimit() {
        let limit = typeof this.localDelayLimit !== "undefined" ?
            this.localDelayLimit : Spine.globalDelayLimit;
        // If limit is 0, this means there is no limit for the delay
        return limit || Number.MAX_VALUE;
    }
    /**
     * Update the spine skeleton and its animations by delta time (dt)
     *
     * @param dt {number} Delta time. Time by which the animation should be updated
     */
    update(dt) {
        // Limit delta value to avoid animation jumps
        let delayLimit = this.delayLimit;
        if (dt > delayLimit)
            dt = delayLimit;
        this.state.update(dt);
        this.state.apply(this.skeleton);
        //check we haven't been destroyed via a spine event callback in state update
        if (!this.skeleton)
            return;
        this.skeleton.updateWorldTransform();
        let slots = this.skeleton.slots;
        // in case pixi has double tint
        let globalClr = this.color;
        let light = null, dark = null;
        if (globalClr) {
            light = globalClr.light;
            dark = globalClr.dark;
        }
        else {
            light = this.tintRgb;
        }
        let thack = false;
        for (let i = 0, n = slots.length; i < n; i++) {
            let slot = slots[i];
            let attachment = slot.attachment;
            let slotContainer = this.slotContainers[i];
            if (!attachment) {
                slotContainer.visible = false;
                continue;
            }
            let spriteColor = null;
            let attColor = attachment.color;
            if (attachment instanceof RegionAttachment_1.RegionAttachment) {
                let region = attachment.region;
                if (region) {
                    if (slot.currentMesh) {
                        slot.currentMesh.visible = false;
                        slot.currentMesh = null;
                        slot.currentMeshName = undefined;
                    }
                    let ar = region;
                    if (!slot.currentSpriteName || slot.currentSpriteName !== ar.name) {
                        let spriteName = ar.name;
                        if (slot.currentSprite) {
                            slot.currentSprite.visible = false;
                        }
                        slot.sprites = slot.sprites || {};
                        if (slot.sprites[spriteName] !== undefined) {
                            slot.sprites[spriteName].visible = true;
                        }
                        else {
                            let sprite = this.createSprite(slot, attachment, spriteName);
                            slotContainer.addChild(sprite);
                        }
                        slot.currentSprite = slot.sprites[spriteName];
                        slot.currentSpriteName = spriteName;
                    }
                }
                let transform = slotContainer.transform;
                transform.setFromMatrix(slot.bone.matrix);
                if (slot.currentSprite.color) {
                    //YAY! double - tint!
                    spriteColor = slot.currentSprite.color;
                }
                else {
                    tempRgb[0] = light[0] * slot.color.r * attColor.r;
                    tempRgb[1] = light[1] * slot.color.g * attColor.g;
                    tempRgb[2] = light[2] * slot.color.b * attColor.b;
                    slot.currentSprite.tint = pixi_js_1.utils.rgb2hex(tempRgb);
                }
                slot.currentSprite.blendMode = slot.blendMode;
            }
            else if (attachment instanceof MeshAttachment_1.MeshAttachment) {
                if (slot.currentSprite) {
                    //TODO: refactor this thing, switch it on and off for container
                    slot.currentSprite.visible = false;
                    slot.currentSprite = null;
                    slot.currentSpriteName = undefined;
                }
                if (!slot.currentMeshName || slot.currentMeshName !== attachment.name) {
                    let meshName = attachment.name;
                    if (slot.currentMesh) {
                        slot.currentMesh.visible = false;
                    }
                    slot.meshes = slot.meshes || {};
                    if (slot.meshes[meshName] !== undefined) {
                        slot.meshes[meshName].visible = true;
                    }
                    else {
                        let mesh = this.createMesh(slot, attachment);
                        slotContainer.addChild(mesh);
                    }
                    slot.currentMesh = slot.meshes[meshName];
                    slot.currentMeshName = meshName;
                }
                attachment.computeWorldVerticesOld(slot, slot.currentMesh.vertices);
                if (slot.currentMesh.color) {
                    // pixi-heaven
                    spriteColor = slot.currentMesh.color;
                }
                else {
                    tempRgb[0] = light[0] * slot.color.r * attColor.r;
                    tempRgb[1] = light[1] * slot.color.g * attColor.g;
                    tempRgb[2] = light[2] * slot.color.b * attColor.b;
                    slot.currentMesh.tint = pixi_js_1.utils.rgb2hex(tempRgb);
                }
                slot.currentMesh.blendMode = slot.blendMode;
            }
            else if (attachment instanceof ClippingAttachment_1.ClippingAttachment) {
                if (!slot.currentGraphics) {
                    this.createGraphics(slot, attachment);
                    slotContainer.addChild(slot.clippingContainer);
                    slotContainer.addChild(slot.currentGraphics);
                }
                this.updateGraphics(slot, attachment);
            }
            else {
                slotContainer.visible = false;
                continue;
            }
            slotContainer.visible = true;
            // pixi has double tint
            if (spriteColor) {
                let r0 = slot.color.r * attColor.r;
                let g0 = slot.color.g * attColor.g;
                let b0 = slot.color.b * attColor.b;
                //YAY! double-tint!
                spriteColor.setLight(light[0] * r0 + dark[0] * (1.0 - r0), light[1] * g0 + dark[1] * (1.0 - g0), light[2] * b0 + dark[2] * (1.0 - b0));
                if (slot.darkColor) {
                    r0 = slot.darkColor.r;
                    g0 = slot.darkColor.g;
                    b0 = slot.darkColor.b;
                }
                else {
                    r0 = 0.0;
                    g0 = 0.0;
                    b0 = 0.0;
                }
                spriteColor.setDark(light[0] * r0 + dark[0] * (1 - r0), light[1] * g0 + dark[1] * (1 - g0), light[2] * b0 + dark[2] * (1 - b0));
            }
            slotContainer.alpha = slot.color.a;
        }
        //== this is clipping implementation ===
        //TODO: remove parent hacks when pixi masks allow it
        let drawOrder = this.skeleton.drawOrder;
        let clippingAttachment = null;
        let clippingContainer = null;
        for (let i = 0, n = drawOrder.length; i < n; i++) {
            let slot = slots[drawOrder[i].data.index];
            let slotContainer = this.slotContainers[drawOrder[i].data.index];
            if (!clippingContainer) {
                //Adding null check as it is possible for slotContainer.parent to be null in the event of a spine being disposed off in its loop callback
                if (slotContainer.parent !== null && slotContainer.parent !== this) {
                    slotContainer.parent.removeChild(slotContainer);
                    //silend add hack
                    slotContainer.parent = this;
                }
            }
            if (slot.currentGraphics && slot.attachment) {
                clippingContainer = slot.clippingContainer;
                clippingAttachment = slot.attachment;
                clippingContainer.children.length = 0;
                this.children[i] = slotContainer;
                if (clippingAttachment.endSlot == slot.data) {
                    clippingAttachment.endSlot = null;
                }
            }
            else {
                if (clippingContainer) {
                    let c = this.tempClipContainers[i];
                    if (!c) {
                        c = this.tempClipContainers[i] = this.newContainer();
                        c.visible = false;
                    }
                    this.children[i] = c;
                    //silent remove hack
                    slotContainer.parent = null;
                    clippingContainer.addChild(slotContainer);
                    if (clippingAttachment.endSlot == slot.data) {
                        clippingContainer.renderable = true;
                        clippingContainer = null;
                        clippingAttachment = null;
                    }
                }
                else {
                    this.children[i] = slotContainer;
                }
            }
        }
    }
    ;
    setSpriteRegion(attachment, sprite, region) {
        sprite.region = region;
        sprite.texture = region.texture;
        if (!region.size) {
            sprite.scale.x = attachment.scaleX * attachment.width / region.originalWidth;
            sprite.scale.y = -attachment.scaleY * attachment.height / region.originalHeight;
        }
        else {
            //hacked!
            sprite.scale.x = region.size.width / region.originalWidth;
            sprite.scale.y = -region.size.height / region.originalHeight;
        }
    }
    setMeshRegion(attachment, mesh, region) {
        mesh.region = region;
        mesh.texture = region.texture;
        region.texture.updateUvs();
        attachment.updateUVs(region, mesh.uvBuffer.data);
        mesh.uvBuffer.update();
    }
    /**
     * When autoupdate is set to yes this function is used as pixi's updateTransform function
     *
     * @private
     */
    autoUpdateTransform() {
        if (Spine.globalAutoUpdate) {
            this.lastTime = this.lastTime || Date.now();
            let timeDelta = (Date.now() - this.lastTime) * 0.001;
            this.lastTime = Date.now();
            this.update(timeDelta);
        }
        else {
            this.lastTime = 0;
        }
        pixi_js_1.Container.prototype.updateTransform.call(this);
    }
    ;
    /**
     * Create a new sprite to be used with RegionAttachment
     *
     * @param slot {spine.Slot} The slot to which the attachment is parented
     * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
     * @private
     */
    createSprite(slot, attachment, defName) {
        let region = attachment.region;
        if (slot.tempAttachment === attachment) {
            region = slot.tempRegion;
            slot.tempAttachment = null;
            slot.tempRegion = null;
        }
        let texture = region.texture;
        let sprite = this.newSprite(texture);
        sprite.rotation = attachment.rotation * Utils_1.MathUtils.degRad;
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;
        sprite.position.x = attachment.x;
        sprite.position.y = attachment.y;
        sprite.alpha = attachment.color.a;
        sprite.region = attachment.region;
        this.setSpriteRegion(attachment, sprite, attachment.region);
        slot.sprites = slot.sprites || {};
        slot.sprites[defName] = sprite;
        return sprite;
    }
    ;
    /**
     * Creates a Strip from the spine data
     * @param slot {spine.Slot} The slot to which the attachment is parented
     * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
     * @private
     */
    createMesh(slot, attachment) {
        let region = attachment.region;
        if (slot.tempAttachment === attachment) {
            region = slot.tempRegion;
            slot.tempAttachment = null;
            slot.tempRegion = null;
        }
        let strip = this.newMesh(region.texture, new Float32Array(attachment.regionUVs.length), new Float32Array(attachment.regionUVs.length), new Uint16Array(attachment.triangles), pixi_js_1.DRAW_MODES.TRIANGLES);
        if (strip.canvasPadding) {
            strip.canvasPadding = 1.5;
        }
        strip.alpha = attachment.color.a;
        strip.region = attachment.region;
        this.setMeshRegion(attachment, strip, region);
        slot.meshes = slot.meshes || {};
        slot.meshes[attachment.name] = strip;
        return strip;
    }
    ;
    createGraphics(slot, clip) {
        let graphics = this.newGraphics();
        let poly = new pixi_js_1.Polygon([]);
        graphics.clear();
        graphics.beginFill(0xffffff, 1);
        graphics.drawPolygon(poly);
        graphics.renderable = false;
        slot.currentGraphics = graphics;
        slot.clippingContainer = this.newContainer();
        slot.clippingContainer.mask = slot.currentGraphics;
        return graphics;
    }
    updateGraphics(slot, clip) {
        let geom = slot.currentGraphics.geometry;
        let vertices = geom.graphicsData[0].shape.points;
        let n = clip.worldVerticesLength;
        vertices.length = n;
        clip.computeWorldVertices(slot, 0, n, vertices, 0, 2);
        geom.dirty++;
        geom.clearDirty++;
    }
    /**
     * Changes texture in attachment in specific slot.
     *
     * PIXI runtime feature, it was made to satisfy our users.
     *
     * @param slotIndex {number}
     * @param [texture = null] {PIXI.Texture} If null, take default (original) texture
     * @param [size = null] {PIXI.Point} sometimes we need new size for region attachment, you can pass 'texture.orig' there
     * @returns {boolean} Success flag
     */
    hackTextureBySlotIndex(slotIndex, texture = null, size = null) {
        let slot = this.skeleton.slots[slotIndex];
        if (!slot) {
            return false;
        }
        let attachment = slot.attachment;
        let region = attachment.region;
        if (texture) {
            region = new Texture_1.TextureRegion();
            region.texture = texture;
            region.size = size;
        }
        if (slot.currentSprite && slot.currentSprite.region != region) {
            this.setSpriteRegion(attachment, slot.currentSprite, region);
            slot.currentSprite.region = region;
        }
        else if (slot.currentMesh && slot.currentMesh.region != region) {
            this.setMeshRegion(attachment, slot.currentMesh, region);
        }
        else {
            slot.tempRegion = region;
            slot.tempAttachment = attachment;
        }
        return true;
    }
    /**
     * Changes texture in attachment in specific slot.
     *
     * PIXI runtime feature, it was made to satisfy our users.
     *
     * @param slotName {string}
     * @param [texture = null] {PIXI.Texture} If null, take default (original) texture
     * @param [size = null] {PIXI.Point} sometimes we need new size for region attachment, you can pass 'texture.orig' there
     * @returns {boolean} Success flag
     */
    hackTextureBySlotName(slotName, texture = null, size = null) {
        let index = this.skeleton.findSlotIndex(slotName);
        if (index == -1) {
            return false;
        }
        return this.hackTextureBySlotIndex(index, texture, size);
    }
    //those methods can be overriden to spawn different classes
    newContainer() {
        return new pixi_js_1.Container();
    }
    newSprite(tex) {
        return new SpineSprite(tex);
    }
    newGraphics() {
        return new pixi_js_1.Graphics();
    }
    newMesh(texture, vertices, uvs, indices, drawMode) {
        return new SpineMesh(texture, vertices, uvs, indices, drawMode);
    }
    transformHack() {
        return 1;
    }
    /**
     * Hack for pixi-display and pixi-lights. Every attachment name ending with a suffix will be added to different layer
     * @param nameSuffix
     * @param group
     * @param outGroup
     */
    hackAttachmentGroups(nameSuffix, group, outGroup) {
        if (!nameSuffix) {
            return;
        }
        const list_d = [], list_n = [];
        for (let i = 0, len = this.skeleton.slots.length; i < len; i++) {
            const slot = this.skeleton.slots[i];
            const name = slot.currentSpriteName || slot.currentMeshName || "";
            const target = slot.currentSprite || slot.currentMesh;
            if (name.endsWith(nameSuffix)) {
                target.parentGroup = group;
                list_n.push(target);
            }
            else if (outGroup && target) {
                target.parentGroup = outGroup;
                list_d.push(target);
            }
        }
        return [list_d, list_n];
    }
    ;
    destroy(options) {
        for (let i = 0, n = this.skeleton.slots.length; i < n; i++) {
            let slot = this.skeleton.slots[i];
            for (let name in slot.meshes) {
                slot.meshes[name].destroy(options);
            }
            slot.meshes = null;
            for (let name in slot.sprites) {
                slot.sprites[name].destroy(options);
            }
            slot.sprites = null;
        }
        for (let i = 0, n = this.slotContainers.length; i < n; i++) {
            this.slotContainers[i].destroy(options);
        }
        this.spineData = null;
        this.skeleton = null;
        this.slotContainers = null;
        this.stateData = null;
        this.state = null;
        this.tempClipContainers = null;
        super.destroy(options);
    }
}
Spine.globalAutoUpdate = true;
Spine.globalDelayLimit = 0;
Spine.clippingPolygon = [];
exports.Spine = Spine;
function SlotContainerUpdateTransformV3() {
    let pt = this.parent.worldTransform;
    let wt = this.worldTransform;
    let lt = this.localTransform;
    wt.a = lt.a * pt.a + lt.b * pt.c;
    wt.b = lt.a * pt.b + lt.b * pt.d;
    wt.c = lt.c * pt.a + lt.d * pt.c;
    wt.d = lt.c * pt.b + lt.d * pt.d;
    wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
    wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
    this.worldAlpha = this.alpha * this.parent.worldAlpha;
    this._currentBounds = null;
}
