import { Sprite, Container, Texture, Rectangle, Graphics, SimpleMesh } from "pixi.js";
import { TextureRegion } from "./core/Texture";
import { SkeletonData } from "./core/SkeletonData";
import { Skeleton } from "./core/Skeleton";
import { AnimationStateData } from "./core/AnimationStateData";
import { AnimationState } from "./core/AnimationState";
import { RegionAttachment } from "./core/attachments/RegionAttachment";
import { MeshAttachment } from "./core/attachments/MeshAttachment";
import { ClippingAttachment } from "./core/attachments/ClippingAttachment";
import { Slot } from "./core/Slot";
import './loaders';
import './polyfills';
export { AtlasParser } from './loaders';
export declare class SpineSprite extends Sprite {
    region: TextureRegion;
}
export declare class SpineMesh extends SimpleMesh {
    region: TextureRegion;
    constructor(texture: Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number);
}
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
export declare class Spine extends Container {
    static globalAutoUpdate: boolean;
    static globalDelayLimit: number;
    tintRgb: ArrayLike<number>;
    spineData: SkeletonData;
    skeleton: Skeleton;
    stateData: AnimationStateData;
    state: AnimationState;
    slotContainers: Array<Container>;
    tempClipContainers: Array<Container>;
    localDelayLimit: number;
    constructor(spineData: SkeletonData);
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
    autoUpdate: boolean;
    /**
     * The tint applied to the spine object. This is a hex value. A value of 0xFFFFFF will remove any tint effect.
     *
     * @member {number}
     * @memberof spine.Spine#
     * @default 0xFFFFFF
     */
    tint: number;
    /**
     * Limit value for the update dt with Spine.globalDelayLimit
     * that can be overridden with localDelayLimit
     * @return {number} - Maximum processed dt value for the update
     */
    readonly delayLimit: number;
    /**
     * Update the spine skeleton and its animations by delta time (dt)
     *
     * @param dt {number} Delta time. Time by which the animation should be updated
     */
    update(dt: number): void;
    private setSpriteRegion;
    private setMeshRegion;
    protected lastTime: number;
    /**
     * When autoupdate is set to yes this function is used as pixi's updateTransform function
     *
     * @private
     */
    autoUpdateTransform(): void;
    /**
     * Create a new sprite to be used with RegionAttachment
     *
     * @param slot {spine.Slot} The slot to which the attachment is parented
     * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
     * @private
     */
    createSprite(slot: Slot, attachment: RegionAttachment, defName: string): SpineSprite;
    /**
     * Creates a Strip from the spine data
     * @param slot {spine.Slot} The slot to which the attachment is parented
     * @param attachment {spine.RegionAttachment} The attachment that the sprite will represent
     * @private
     */
    createMesh(slot: Slot, attachment: MeshAttachment): SpineMesh;
    static clippingPolygon: Array<number>;
    createGraphics(slot: Slot, clip: ClippingAttachment): Graphics;
    updateGraphics(slot: Slot, clip: ClippingAttachment): void;
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
    hackTextureBySlotIndex(slotIndex: number, texture?: Texture, size?: Rectangle): boolean;
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
    hackTextureBySlotName(slotName: string, texture?: Texture, size?: Rectangle): boolean;
    newContainer(): Container;
    newSprite(tex: Texture): SpineSprite;
    newGraphics(): Graphics;
    newMesh(texture: Texture, vertices?: Float32Array, uvs?: Float32Array, indices?: Uint16Array, drawMode?: number): SpineMesh;
    transformHack(): number;
    /**
     * Hack for pixi-display and pixi-lights. Every attachment name ending with a suffix will be added to different layer
     * @param nameSuffix
     * @param group
     * @param outGroup
     */
    hackAttachmentGroups(nameSuffix: string, group: any, outGroup: any): any[][];
    destroy(options?: any): void;
}
