import { Skeleton } from "./Skeleton";
import { ArrayLike } from "./Utils";
import { VertexAttachment } from "./attachments/Attachment";
import { Event } from "./Event";
/******************************************************************************
 * Spine Runtimes Software License v2.5
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
export declare class Animation {
    name: string;
    timelines: Array<Timeline>;
    duration: number;
    constructor(name: string, timelines: Array<Timeline>, duration: number);
    apply(skeleton: Skeleton, lastTime: number, time: number, loop: boolean, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    static binarySearch(values: ArrayLike<number>, target: number, step?: number): number;
    static linearSearch(values: ArrayLike<number>, target: number, step: number): number;
}
export interface Timeline {
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
    getPropertyId(): number;
}
export declare enum MixBlend {
    setup = 0,
    first = 1,
    replace = 2,
    add = 3
}
export declare enum MixDirection {
    in = 0,
    out = 1
}
export declare enum TimelineType {
    rotate = 0,
    translate = 1,
    scale = 2,
    shear = 3,
    attachment = 4,
    color = 5,
    deform = 6,
    event = 7,
    drawOrder = 8,
    ikConstraint = 9,
    transformConstraint = 10,
    pathConstraintPosition = 11,
    pathConstraintSpacing = 12,
    pathConstraintMix = 13,
    twoColor = 14
}
export declare abstract class CurveTimeline implements Timeline {
    static LINEAR: number;
    static STEPPED: number;
    static BEZIER: number;
    static BEZIER_SIZE: number;
    private curves;
    abstract getPropertyId(): number;
    constructor(frameCount: number);
    getFrameCount(): number;
    setLinear(frameIndex: number): void;
    setStepped(frameIndex: number): void;
    getCurveType(frameIndex: number): number;
    /** Sets the control handle positions for an interpolation bezier curve used to transition from this keyframe to the next.
     * cx1 and cx2 are from 0 to 1, representing the percent of time between the two keyframes. cy1 and cy2 are the percent of
     * the difference between the keyframe's values. */
    setCurve(frameIndex: number, cx1: number, cy1: number, cx2: number, cy2: number): void;
    getCurvePercent(frameIndex: number, percent: number): number;
    abstract apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class RotateTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATION: number;
    static ROTATION: number;
    boneIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and angle of the specified keyframe. */
    setFrame(frameIndex: number, time: number, degrees: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class TranslateTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_X: number;
    static PREV_Y: number;
    static X: number;
    static Y: number;
    boneIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, x: number, y: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class ScaleTimeline extends TranslateTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class ShearTimeline extends TranslateTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class ColorTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_R: number;
    static PREV_G: number;
    static PREV_B: number;
    static PREV_A: number;
    static R: number;
    static G: number;
    static B: number;
    static A: number;
    slotIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, r: number, g: number, b: number, a: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class TwoColorTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_R: number;
    static PREV_G: number;
    static PREV_B: number;
    static PREV_A: number;
    static PREV_R2: number;
    static PREV_G2: number;
    static PREV_B2: number;
    static R: number;
    static G: number;
    static B: number;
    static A: number;
    static R2: number;
    static G2: number;
    static B2: number;
    slotIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, r: number, g: number, b: number, a: number, r2: number, g2: number, b2: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class AttachmentTimeline implements Timeline {
    slotIndex: number;
    frames: ArrayLike<number>;
    attachmentNames: Array<string>;
    constructor(frameCount: number);
    getPropertyId(): number;
    getFrameCount(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, attachmentName: string): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, events: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class DeformTimeline extends CurveTimeline {
    slotIndex: number;
    attachment: VertexAttachment;
    frames: ArrayLike<number>;
    frameVertices: Array<ArrayLike<number>>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time of the specified keyframe. */
    setFrame(frameIndex: number, time: number, vertices: ArrayLike<number>): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class EventTimeline implements Timeline {
    frames: ArrayLike<number>;
    events: Array<Event>;
    constructor(frameCount: number);
    getPropertyId(): number;
    getFrameCount(): number;
    /** Sets the time of the specified keyframe. */
    setFrame(frameIndex: number, event: Event): void;
    /** Fires events for frames > lastTime and <= time. */
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class DrawOrderTimeline implements Timeline {
    frames: ArrayLike<number>;
    drawOrders: Array<Array<number>>;
    constructor(frameCount: number);
    getPropertyId(): number;
    getFrameCount(): number;
    /** Sets the time of the specified keyframe.
     * @param drawOrder May be null to use bind pose draw order. */
    setFrame(frameIndex: number, time: number, drawOrder: Array<number>): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class IkConstraintTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_MIX: number;
    static PREV_BEND_DIRECTION: number;
    static PREV_COMPRESS: number;
    static PREV_STRETCH: number;
    static MIX: number;
    static BEND_DIRECTION: number;
    static COMPRESS: number;
    static STRETCH: number;
    ikConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time, mix and bend direction of the specified keyframe. */
    setFrame(frameIndex: number, time: number, mix: number, bendDirection: number, compress: boolean, stretch: boolean): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class TransformConstraintTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATE: number;
    static PREV_TRANSLATE: number;
    static PREV_SCALE: number;
    static PREV_SHEAR: number;
    static ROTATE: number;
    static TRANSLATE: number;
    static SCALE: number;
    static SHEAR: number;
    transformConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and mixes of the specified keyframe. */
    setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number, scaleMix: number, shearMix: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class PathConstraintPositionTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_VALUE: number;
    static VALUE: number;
    pathConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and value of the specified keyframe. */
    setFrame(frameIndex: number, time: number, value: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class PathConstraintSpacingTimeline extends PathConstraintPositionTimeline {
    constructor(frameCount: number);
    getPropertyId(): number;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
export declare class PathConstraintMixTimeline extends CurveTimeline {
    static ENTRIES: number;
    static PREV_TIME: number;
    static PREV_ROTATE: number;
    static PREV_TRANSLATE: number;
    static ROTATE: number;
    static TRANSLATE: number;
    pathConstraintIndex: number;
    frames: ArrayLike<number>;
    constructor(frameCount: number);
    getPropertyId(): number;
    /** Sets the time and mixes of the specified keyframe. */
    setFrame(frameIndex: number, time: number, rotateMix: number, translateMix: number): void;
    apply(skeleton: Skeleton, lastTime: number, time: number, firedEvents: Array<Event>, alpha: number, blend: MixBlend, direction: MixDirection): void;
}
