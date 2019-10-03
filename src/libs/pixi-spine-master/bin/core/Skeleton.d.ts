import { SkeletonData } from "./SkeletonData";
import { Bone } from "./Bone";
import { Slot } from "./Slot";
import { IkConstraint } from "./IkConstraint";
import { TransformConstraint } from "./TransformConstraint";
import { PathConstraint } from "./PathConstraint";
import { Updatable } from "./Updatable";
import { Skin } from "./Skin";
import { Color, Vector2 } from "./Utils";
import { Attachment } from "./attachments/Attachment";
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
export declare class Skeleton {
    data: SkeletonData;
    bones: Array<Bone>;
    slots: Array<Slot>;
    drawOrder: Array<Slot>;
    ikConstraints: Array<IkConstraint>;
    transformConstraints: Array<TransformConstraint>;
    pathConstraints: Array<PathConstraint>;
    _updateCache: Updatable[];
    updateCacheReset: Updatable[];
    skin: Skin;
    color: Color;
    time: number;
    scaleX: number;
    scaleY: number;
    x: number;
    y: number;
    constructor(data: SkeletonData);
    updateCache(): void;
    sortIkConstraint(constraint: IkConstraint): void;
    sortPathConstraint(constraint: PathConstraint): void;
    sortTransformConstraint(constraint: TransformConstraint): void;
    sortPathConstraintAttachment(skin: Skin, slotIndex: number, slotBone: Bone): void;
    sortPathConstraintAttachmentWith(attachment: Attachment, slotBone: Bone): void;
    sortBone(bone: Bone): void;
    sortReset(bones: Array<Bone>): void;
    /** Updates the world transform for each bone and applies constraints. */
    updateWorldTransform(): void;
    /** Sets the bones, constraints, and slots to their setup pose values. */
    setToSetupPose(): void;
    /** Sets the bones and constraints to their setup pose values. */
    setBonesToSetupPose(): void;
    setSlotsToSetupPose(): void;
    /** @return May return null. */
    getRootBone(): Bone;
    /** @return May be null. */
    findBone(boneName: string): Bone;
    /** @return -1 if the bone was not found. */
    findBoneIndex(boneName: string): number;
    /** @return May be null. */
    findSlot(slotName: string): Slot;
    /** @return -1 if the bone was not found. */
    findSlotIndex(slotName: string): number;
    /** Sets a skin by name.
     * @see #setSkin(Skin) */
    setSkinByName(skinName: string): void;
    /** Sets the skin used to look up attachments before looking in the {@link SkeletonData#getDefaultSkin() default skin}.
     * Attachments from the new skin are attached if the corresponding attachment from the old skin was attached. If there was no
     * old skin, each slot's setup mode attachment is attached from the new skin.
     * @param newSkin May be null. */
    setSkin(newSkin: Skin | null): void;
    /** @return May be null. */
    getAttachmentByName(slotName: string, attachmentName: string): Attachment;
    /** @return May be null. */
    getAttachment(slotIndex: number, attachmentName: string): Attachment;
    /** @param attachmentName May be null. */
    setAttachment(slotName: string, attachmentName: string): void;
    /** @return May be null. */
    findIkConstraint(constraintName: string): IkConstraint;
    /** @return May be null. */
    findTransformConstraint(constraintName: string): TransformConstraint;
    /** @return May be null. */
    findPathConstraint(constraintName: string): PathConstraint;
    /** Returns the axis aligned bounding box (AABB) of the region and mesh attachments for the current pose.
     * @param offset The distance from the skeleton origin to the bottom left corner of the AABB.
     * @param size The width and height of the AABB.
     * @param temp Working memory */
    getBounds(offset: Vector2, size: Vector2, temp: Array<number>): void;
    update(delta: number): void;
    flipX: boolean;
    flipY: boolean;
    private static deprecatedWarning1;
}
