import { AnimationStateData } from "./AnimationStateData";
import { Animation, MixBlend, Timeline } from "./Animation";
import { IntSet, Pool } from "./Utils";
import { Skeleton } from "./Skeleton";
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
export declare class AnimationState {
    static emptyAnimation: Animation;
    static SUBSEQUENT: number;
    static FIRST: number;
    static HOLD: number;
    static HOLD_MIX: number;
    data: AnimationStateData;
    tracks: TrackEntry[];
    events: Event[];
    listeners: AnimationStateListener2[];
    queue: EventQueue;
    propertyIDs: IntSet;
    animationsChanged: boolean;
    timeScale: number;
    trackEntryPool: Pool<TrackEntry>;
    constructor(data: AnimationStateData);
    update(delta: number): void;
    updateMixingFrom(to: TrackEntry, delta: number): boolean;
    apply(skeleton: Skeleton): boolean;
    applyMixingFrom(to: TrackEntry, skeleton: Skeleton, blend: MixBlend): number;
    applyRotateTimeline(timeline: Timeline, skeleton: Skeleton, time: number, alpha: number, blend: MixBlend, timelinesRotation: Array<number>, i: number, firstFrame: boolean): void;
    queueEvents(entry: TrackEntry, animationTime: number): void;
    clearTracks(): void;
    clearTrack(trackIndex: number): void;
    setCurrent(index: number, current: TrackEntry, interrupt: boolean): void;
    setAnimation(trackIndex: number, animationName: string, loop: boolean): TrackEntry;
    setAnimationWith(trackIndex: number, animation: Animation, loop: boolean): TrackEntry;
    addAnimation(trackIndex: number, animationName: string, loop: boolean, delay: number): TrackEntry;
    addAnimationWith(trackIndex: number, animation: Animation, loop: boolean, delay: number): TrackEntry;
    setEmptyAnimation(trackIndex: number, mixDuration: number): TrackEntry;
    addEmptyAnimation(trackIndex: number, mixDuration: number, delay: number): TrackEntry;
    setEmptyAnimations(mixDuration: number): void;
    expandToIndex(index: number): TrackEntry;
    trackEntry(trackIndex: number, animation: Animation, loop: boolean, last: TrackEntry): TrackEntry;
    disposeNext(entry: TrackEntry): void;
    _animationsChanged(): void;
    setTimelineModes(entry: TrackEntry): void;
    hasTimeline(entry: TrackEntry, id: number): boolean;
    getCurrent(trackIndex: number): TrackEntry;
    addListener(listener: AnimationStateListener2): void;
    /** Removes the listener added with {@link #addListener(AnimationStateListener)}. */
    removeListener(listener: AnimationStateListener2): void;
    clearListeners(): void;
    clearListenerNotifications(): void;
    onComplete: (trackIndex: number, loopCount: number) => any;
    onEvent: (trackIndex: number, event: Event) => any;
    onStart: (trackIndex: number) => any;
    onEnd: (trackIndex: number) => any;
    private static deprecatedWarning1;
    setAnimationByName(trackIndex: number, animationName: string, loop: boolean): void;
    private static deprecatedWarning2;
    addAnimationByName(trackIndex: number, animationName: string, loop: boolean, delay: number): void;
    private static deprecatedWarning3;
    hasAnimation(animationName: string): boolean;
    hasAnimationByName(animationName: string): boolean;
}
export declare class TrackEntry {
    animation: Animation;
    next: TrackEntry;
    mixingFrom: TrackEntry;
    mixingTo: TrackEntry;
    listener: AnimationStateListener2;
    trackIndex: number;
    loop: boolean;
    holdPrevious: boolean;
    eventThreshold: number;
    attachmentThreshold: number;
    drawOrderThreshold: number;
    animationStart: number;
    animationEnd: number;
    animationLast: number;
    nextAnimationLast: number;
    delay: number;
    trackTime: number;
    trackLast: number;
    nextTrackLast: number;
    trackEnd: number;
    timeScale: number;
    alpha: number;
    mixTime: number;
    mixDuration: number;
    interruptAlpha: number;
    totalAlpha: number;
    mixBlend: MixBlend;
    timelineMode: number[];
    timelineHoldMix: TrackEntry[];
    timelinesRotation: number[];
    reset(): void;
    getAnimationTime(): number;
    setAnimationLast(animationLast: number): void;
    isComplete(): boolean;
    resetRotationDirections(): void;
    onComplete: (trackIndex: number, loopCount: number) => any;
    onEvent: (trackIndex: number, event: Event) => any;
    onStart: (trackIndex: number) => any;
    onEnd: (trackIndex: number) => any;
    private static deprecatedWarning1;
    private static deprecatedWarning2;
    time: number;
    endTime: number;
    loopsCount(): number;
}
export declare class EventQueue {
    objects: Array<any>;
    drainDisabled: boolean;
    animState: AnimationState;
    constructor(animState: AnimationState);
    start(entry: TrackEntry): void;
    interrupt(entry: TrackEntry): void;
    end(entry: TrackEntry): void;
    dispose(entry: TrackEntry): void;
    complete(entry: TrackEntry): void;
    event(entry: TrackEntry, event: Event): void;
    private static deprecatedWarning1;
    deprecateStuff(): boolean;
    drain(): void;
    clear(): void;
}
export declare enum EventType {
    start = 0,
    interrupt = 1,
    end = 2,
    dispose = 3,
    complete = 4,
    event = 5
}
export interface AnimationStateListener2 {
    /** Invoked when this entry has been set as the current entry. */
    start?(entry: TrackEntry): void;
    /** Invoked when another entry has replaced this entry as the current entry. This entry may continue being applied for
     * mixing. */
    interrupt?(entry: TrackEntry): void;
    /** Invoked when this entry is no longer the current entry and will never be applied again. */
    end?(entry: TrackEntry): void;
    /** Invoked when this entry will be disposed. This may occur without the entry ever being set as the current entry.
     * References to the entry should not be kept after dispose is called, as it may be destroyed or reused. */
    dispose?(entry: TrackEntry): void;
    /** Invoked every time this entry's animation completes a loop. */
    complete?(entry: TrackEntry): void;
    /** Invoked when this entry's animation triggers an event. */
    event?(entry: TrackEntry, event: Event): void;
}
export declare abstract class AnimationStateAdapter2 implements AnimationStateListener2 {
    start(entry: TrackEntry): void;
    interrupt(entry: TrackEntry): void;
    end(entry: TrackEntry): void;
    dispose(entry: TrackEntry): void;
    complete(entry: TrackEntry): void;
    event(entry: TrackEntry, event: Event): void;
}
