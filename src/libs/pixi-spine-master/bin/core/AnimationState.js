"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Animation_1 = require("./Animation");
const Utils_1 = require("./Utils");
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
class AnimationState {
    constructor(data) {
        this.tracks = new Array();
        this.events = new Array();
        this.listeners = new Array();
        this.queue = new EventQueue(this);
        this.propertyIDs = new Utils_1.IntSet();
        this.animationsChanged = false;
        this.timeScale = 1;
        this.trackEntryPool = new Utils_1.Pool(() => new TrackEntry());
        this.data = data;
    }
    update(delta) {
        delta *= this.timeScale;
        let tracks = this.tracks;
        for (let i = 0, n = tracks.length; i < n; i++) {
            let current = tracks[i];
            if (current == null)
                continue;
            current.animationLast = current.nextAnimationLast;
            current.trackLast = current.nextTrackLast;
            let currentDelta = delta * current.timeScale;
            if (current.delay > 0) {
                current.delay -= currentDelta;
                if (current.delay > 0)
                    continue;
                currentDelta = -current.delay;
                current.delay = 0;
            }
            let next = current.next;
            if (next != null) {
                // When the next entry's delay is passed, change to the next entry, preserving leftover time.
                let nextTime = current.trackLast - next.delay;
                if (nextTime >= 0) {
                    next.delay = 0;
                    next.trackTime = current.timeScale == 0 ? 0 : (nextTime / current.timeScale + delta) * next.timeScale;
                    current.trackTime += currentDelta;
                    this.setCurrent(i, next, true);
                    while (next.mixingFrom != null) {
                        next.mixTime += delta;
                        next = next.mixingFrom;
                    }
                    continue;
                }
            }
            else if (current.trackLast >= current.trackEnd && current.mixingFrom == null) {
                tracks[i] = null;
                this.queue.end(current);
                this.disposeNext(current);
                continue;
            }
            if (current.mixingFrom != null && this.updateMixingFrom(current, delta)) {
                // End mixing from entries once all have completed.
                let from = current.mixingFrom;
                current.mixingFrom = null;
                if (from != null)
                    from.mixingTo = null;
                while (from != null) {
                    this.queue.end(from);
                    from = from.mixingFrom;
                }
            }
            current.trackTime += currentDelta;
        }
        this.queue.drain();
    }
    updateMixingFrom(to, delta) {
        let from = to.mixingFrom;
        if (from == null)
            return true;
        let finished = this.updateMixingFrom(from, delta);
        from.animationLast = from.nextAnimationLast;
        from.trackLast = from.nextTrackLast;
        // Require mixTime > 0 to ensure the mixing from entry was applied at least once.
        if (to.mixTime > 0 && to.mixTime >= to.mixDuration) {
            // Require totalAlpha == 0 to ensure mixing is complete, unless mixDuration == 0 (the transition is a single frame).
            if (from.totalAlpha == 0 || to.mixDuration == 0) {
                to.mixingFrom = from.mixingFrom;
                if (from.mixingFrom != null)
                    from.mixingFrom.mixingTo = to;
                to.interruptAlpha = from.interruptAlpha;
                this.queue.end(from);
            }
            return finished;
        }
        from.trackTime += delta * from.timeScale;
        to.mixTime += delta;
        return false;
    }
    apply(skeleton) {
        if (skeleton == null)
            throw new Error("skeleton cannot be null.");
        if (this.animationsChanged)
            this._animationsChanged();
        let events = this.events;
        let tracks = this.tracks;
        let applied = false;
        for (let i = 0, n = tracks.length; i < n; i++) {
            let current = tracks[i];
            if (current == null || current.delay > 0)
                continue;
            applied = true;
            let blend = i == 0 ? Animation_1.MixBlend.first : current.mixBlend;
            // Apply mixing from entries first.
            let mix = current.alpha;
            if (current.mixingFrom != null)
                mix *= this.applyMixingFrom(current, skeleton, blend);
            else if (current.trackTime >= current.trackEnd && current.next == null)
                mix = 0;
            // Apply current entry.
            let animationLast = current.animationLast, animationTime = current.getAnimationTime();
            let timelineCount = current.animation.timelines.length;
            let timelines = current.animation.timelines;
            if (i == 0 && (mix == 1 || blend == Animation_1.MixBlend.add)) {
                for (let ii = 0; ii < timelineCount; ii++)
                    timelines[ii].apply(skeleton, animationLast, animationTime, events, mix, blend, Animation_1.MixDirection.in);
            }
            else {
                let timelineMode = current.timelineMode;
                let firstFrame = current.timelinesRotation.length == 0;
                if (firstFrame)
                    Utils_1.Utils.setArraySize(current.timelinesRotation, timelineCount << 1, null);
                let timelinesRotation = current.timelinesRotation;
                for (let ii = 0; ii < timelineCount; ii++) {
                    let timeline = timelines[ii];
                    let timelineBlend = timelineMode[ii] == AnimationState.SUBSEQUENT ? blend : Animation_1.MixBlend.setup;
                    if (timeline instanceof Animation_1.RotateTimeline) {
                        this.applyRotateTimeline(timeline, skeleton, animationTime, mix, timelineBlend, timelinesRotation, ii << 1, firstFrame);
                    }
                    else {
                        // This fixes the WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
                        Utils_1.Utils.webkit602BugfixHelper(mix, blend);
                        timeline.apply(skeleton, animationLast, animationTime, events, mix, timelineBlend, Animation_1.MixDirection.in);
                    }
                }
            }
            this.queueEvents(current, animationTime);
            events.length = 0;
            current.nextAnimationLast = animationTime;
            current.nextTrackLast = current.trackTime;
        }
        this.queue.drain();
        return applied;
    }
    applyMixingFrom(to, skeleton, blend) {
        let from = to.mixingFrom;
        if (from.mixingFrom != null)
            this.applyMixingFrom(from, skeleton, blend);
        let mix = 0;
        if (to.mixDuration == 0) { // Single frame mix to undo mixingFrom changes.
            mix = 1;
            if (blend == Animation_1.MixBlend.first)
                blend = Animation_1.MixBlend.setup;
        }
        else {
            mix = to.mixTime / to.mixDuration;
            if (mix > 1)
                mix = 1;
            if (blend != Animation_1.MixBlend.first)
                blend = from.mixBlend;
        }
        let events = mix < from.eventThreshold ? this.events : null;
        let attachments = mix < from.attachmentThreshold, drawOrder = mix < from.drawOrderThreshold;
        let animationLast = from.animationLast, animationTime = from.getAnimationTime();
        let timelineCount = from.animation.timelines.length;
        let timelines = from.animation.timelines;
        let alphaHold = from.alpha * to.interruptAlpha, alphaMix = alphaHold * (1 - mix);
        if (blend == Animation_1.MixBlend.add) {
            for (let i = 0; i < timelineCount; i++)
                timelines[i].apply(skeleton, animationLast, animationTime, events, alphaMix, blend, Animation_1.MixDirection.out);
        }
        else {
            let timelineMode = from.timelineMode;
            let timelineHoldMix = from.timelineHoldMix;
            let firstFrame = from.timelinesRotation.length == 0;
            if (firstFrame)
                Utils_1.Utils.setArraySize(from.timelinesRotation, timelineCount << 1, null);
            let timelinesRotation = from.timelinesRotation;
            from.totalAlpha = 0;
            for (let i = 0; i < timelineCount; i++) {
                let timeline = timelines[i];
                let direction = Animation_1.MixDirection.out;
                let timelineBlend;
                let alpha = 0;
                switch (timelineMode[i]) {
                    case AnimationState.SUBSEQUENT:
                        if (!attachments && timeline instanceof Animation_1.AttachmentTimeline)
                            continue;
                        if (!drawOrder && timeline instanceof Animation_1.DrawOrderTimeline)
                            continue;
                        timelineBlend = blend;
                        alpha = alphaMix;
                        break;
                    case AnimationState.FIRST:
                        timelineBlend = Animation_1.MixBlend.setup;
                        alpha = alphaMix;
                        break;
                    case AnimationState.HOLD:
                        timelineBlend = Animation_1.MixBlend.setup;
                        alpha = alphaHold;
                        break;
                    default:
                        timelineBlend = Animation_1.MixBlend.setup;
                        let holdMix = timelineHoldMix[i];
                        alpha = alphaHold * Math.max(0, 1 - holdMix.mixTime / holdMix.mixDuration);
                        break;
                }
                from.totalAlpha += alpha;
                if (timeline instanceof Animation_1.RotateTimeline)
                    this.applyRotateTimeline(timeline, skeleton, animationTime, alpha, timelineBlend, timelinesRotation, i << 1, firstFrame);
                else {
                    // This fixes the WebKit 602 specific issue described at http://esotericsoftware.com/forum/iOS-10-disappearing-graphics-10109
                    Utils_1.Utils.webkit602BugfixHelper(alpha, blend);
                    if (timelineBlend == Animation_1.MixBlend.setup) {
                        if (timeline instanceof Animation_1.AttachmentTimeline) {
                            if (attachments)
                                direction = Animation_1.MixDirection.out;
                        }
                        else if (timeline instanceof Animation_1.DrawOrderTimeline) {
                            if (drawOrder)
                                direction = Animation_1.MixDirection.out;
                        }
                    }
                    timeline.apply(skeleton, animationLast, animationTime, events, alpha, timelineBlend, direction);
                }
            }
        }
        if (to.mixDuration > 0)
            this.queueEvents(from, animationTime);
        this.events.length = 0;
        from.nextAnimationLast = animationTime;
        from.nextTrackLast = from.trackTime;
        return mix;
    }
    applyRotateTimeline(timeline, skeleton, time, alpha, blend, timelinesRotation, i, firstFrame) {
        if (firstFrame)
            timelinesRotation[i] = 0;
        if (alpha == 1) {
            timeline.apply(skeleton, 0, time, null, 1, blend, Animation_1.MixDirection.in);
            return;
        }
        let rotateTimeline = timeline;
        let frames = rotateTimeline.frames;
        let bone = skeleton.bones[rotateTimeline.boneIndex];
        let r1 = 0, r2 = 0;
        if (time < frames[0]) {
            switch (blend) {
                case Animation_1.MixBlend.setup:
                    bone.rotation = bone.data.rotation;
                default:
                    return;
                case Animation_1.MixBlend.first:
                    r1 = bone.rotation;
                    r2 = bone.data.rotation;
            }
        }
        else {
            r1 = blend == Animation_1.MixBlend.setup ? bone.data.rotation : bone.rotation;
            if (time >= frames[frames.length - Animation_1.RotateTimeline.ENTRIES]) // Time is after last frame.
                r2 = bone.data.rotation + frames[frames.length + Animation_1.RotateTimeline.PREV_ROTATION];
            else {
                // Interpolate between the previous frame and the current frame.
                let frame = Animation_1.Animation.binarySearch(frames, time, Animation_1.RotateTimeline.ENTRIES);
                let prevRotation = frames[frame + Animation_1.RotateTimeline.PREV_ROTATION];
                let frameTime = frames[frame];
                let percent = rotateTimeline.getCurvePercent((frame >> 1) - 1, 1 - (time - frameTime) / (frames[frame + Animation_1.RotateTimeline.PREV_TIME] - frameTime));
                r2 = frames[frame + Animation_1.RotateTimeline.ROTATION] - prevRotation;
                r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
                r2 = prevRotation + r2 * percent + bone.data.rotation;
                r2 -= (16384 - ((16384.499999999996 - r2 / 360) | 0)) * 360;
            }
        }
        // Mix between rotations using the direction of the shortest route on the first frame while detecting crosses.
        let total = 0, diff = r2 - r1;
        diff -= (16384 - ((16384.499999999996 - diff / 360) | 0)) * 360;
        if (diff == 0) {
            total = timelinesRotation[i];
        }
        else {
            let lastTotal = 0, lastDiff = 0;
            if (firstFrame) {
                lastTotal = 0;
                lastDiff = diff;
            }
            else {
                lastTotal = timelinesRotation[i]; // Angle and direction of mix, including loops.
                lastDiff = timelinesRotation[i + 1]; // Difference between bones.
            }
            let current = diff > 0, dir = lastTotal >= 0;
            // Detect cross at 0 (not 180).
            if (Utils_1.MathUtils.signum(lastDiff) != Utils_1.MathUtils.signum(diff) && Math.abs(lastDiff) <= 90) {
                // A cross after a 360 rotation is a loop.
                if (Math.abs(lastTotal) > 180)
                    lastTotal += 360 * Utils_1.MathUtils.signum(lastTotal);
                dir = current;
            }
            total = diff + lastTotal - lastTotal % 360; // Store loops as part of lastTotal.
            if (dir != current)
                total += 360 * Utils_1.MathUtils.signum(lastTotal);
            timelinesRotation[i] = total;
        }
        timelinesRotation[i + 1] = diff;
        r1 += total * alpha;
        bone.rotation = r1 - (16384 - ((16384.499999999996 - r1 / 360) | 0)) * 360;
    }
    queueEvents(entry, animationTime) {
        let animationStart = entry.animationStart, animationEnd = entry.animationEnd;
        let duration = animationEnd - animationStart;
        let trackLastWrapped = entry.trackLast % duration;
        // Queue events before complete.
        let events = this.events;
        let i = 0, n = events.length;
        for (; i < n; i++) {
            let event = events[i];
            if (event.time < trackLastWrapped)
                break;
            if (event.time > animationEnd)
                continue; // Discard events outside animation start/end.
            this.queue.event(entry, event);
        }
        // Queue complete if completed a loop iteration or the animation.
        let complete = false;
        if (entry.loop)
            complete = duration == 0 || trackLastWrapped > entry.trackTime % duration;
        else
            complete = animationTime >= animationEnd && entry.animationLast < animationEnd;
        if (complete)
            this.queue.complete(entry);
        // Queue events after complete.
        for (; i < n; i++) {
            let event = events[i];
            if (event.time < animationStart)
                continue; // Discard events outside animation start/end.
            this.queue.event(entry, events[i]);
        }
    }
    clearTracks() {
        let oldDrainDisabled = this.queue.drainDisabled;
        this.queue.drainDisabled = true;
        for (let i = 0, n = this.tracks.length; i < n; i++)
            this.clearTrack(i);
        this.tracks.length = 0;
        this.queue.drainDisabled = oldDrainDisabled;
        this.queue.drain();
    }
    clearTrack(trackIndex) {
        if (trackIndex >= this.tracks.length)
            return;
        let current = this.tracks[trackIndex];
        if (current == null)
            return;
        this.queue.end(current);
        this.disposeNext(current);
        let entry = current;
        while (true) {
            let from = entry.mixingFrom;
            if (from == null)
                break;
            this.queue.end(from);
            entry.mixingFrom = null;
            entry.mixingTo = null;
            entry = from;
        }
        this.tracks[current.trackIndex] = null;
        this.queue.drain();
    }
    setCurrent(index, current, interrupt) {
        let from = this.expandToIndex(index);
        this.tracks[index] = current;
        if (from != null) {
            if (interrupt)
                this.queue.interrupt(from);
            current.mixingFrom = from;
            from.mixingTo = current;
            current.mixTime = 0;
            // Store the interrupted mix percentage.
            if (from.mixingFrom != null && from.mixDuration > 0)
                current.interruptAlpha *= Math.min(1, from.mixTime / from.mixDuration);
            from.timelinesRotation.length = 0; // Reset rotation for mixing out, in case entry was mixed in.
        }
        this.queue.start(current);
    }
    setAnimation(trackIndex, animationName, loop) {
        let animation = this.data.skeletonData.findAnimation(animationName);
        if (animation == null)
            throw new Error("Animation not found: " + animationName);
        return this.setAnimationWith(trackIndex, animation, loop);
    }
    setAnimationWith(trackIndex, animation, loop) {
        if (animation == null)
            throw new Error("animation cannot be null.");
        let interrupt = true;
        let current = this.expandToIndex(trackIndex);
        if (current != null) {
            if (current.nextTrackLast == -1) {
                // Don't mix from an entry that was never applied.
                this.tracks[trackIndex] = current.mixingFrom;
                this.queue.interrupt(current);
                this.queue.end(current);
                this.disposeNext(current);
                current = current.mixingFrom;
                interrupt = false;
            }
            else
                this.disposeNext(current);
        }
        let entry = this.trackEntry(trackIndex, animation, loop, current);
        this.setCurrent(trackIndex, entry, interrupt);
        this.queue.drain();
        return entry;
    }
    addAnimation(trackIndex, animationName, loop, delay) {
        let animation = this.data.skeletonData.findAnimation(animationName);
        if (animation == null)
            throw new Error("Animation not found: " + animationName);
        return this.addAnimationWith(trackIndex, animation, loop, delay);
    }
    addAnimationWith(trackIndex, animation, loop, delay) {
        if (animation == null)
            throw new Error("animation cannot be null.");
        let last = this.expandToIndex(trackIndex);
        if (last != null) {
            while (last.next != null)
                last = last.next;
        }
        let entry = this.trackEntry(trackIndex, animation, loop, last);
        if (last == null) {
            this.setCurrent(trackIndex, entry, true);
            this.queue.drain();
        }
        else {
            last.next = entry;
            if (delay <= 0) {
                let duration = last.animationEnd - last.animationStart;
                if (duration != 0) {
                    if (last.loop)
                        delay += duration * (1 + ((last.trackTime / duration) | 0));
                    else
                        delay += Math.max(duration, last.trackTime);
                    delay -= this.data.getMix(last.animation, animation);
                }
                else
                    delay = last.trackTime;
            }
        }
        entry.delay = delay;
        return entry;
    }
    setEmptyAnimation(trackIndex, mixDuration) {
        let entry = this.setAnimationWith(trackIndex, AnimationState.emptyAnimation, false);
        entry.mixDuration = mixDuration;
        entry.trackEnd = mixDuration;
        return entry;
    }
    addEmptyAnimation(trackIndex, mixDuration, delay) {
        if (delay <= 0)
            delay -= mixDuration;
        let entry = this.addAnimationWith(trackIndex, AnimationState.emptyAnimation, false, delay);
        entry.mixDuration = mixDuration;
        entry.trackEnd = mixDuration;
        return entry;
    }
    setEmptyAnimations(mixDuration) {
        let oldDrainDisabled = this.queue.drainDisabled;
        this.queue.drainDisabled = true;
        for (let i = 0, n = this.tracks.length; i < n; i++) {
            let current = this.tracks[i];
            if (current != null)
                this.setEmptyAnimation(current.trackIndex, mixDuration);
        }
        this.queue.drainDisabled = oldDrainDisabled;
        this.queue.drain();
    }
    expandToIndex(index) {
        if (index < this.tracks.length)
            return this.tracks[index];
        Utils_1.Utils.ensureArrayCapacity(this.tracks, index - this.tracks.length + 1, null);
        this.tracks.length = index + 1;
        return null;
    }
    trackEntry(trackIndex, animation, loop, last) {
        let entry = this.trackEntryPool.obtain();
        entry.trackIndex = trackIndex;
        entry.animation = animation;
        entry.loop = loop;
        entry.holdPrevious = false;
        entry.eventThreshold = 0;
        entry.attachmentThreshold = 0;
        entry.drawOrderThreshold = 0;
        entry.animationStart = 0;
        entry.animationEnd = animation.duration;
        entry.animationLast = -1;
        entry.nextAnimationLast = -1;
        entry.delay = 0;
        entry.trackTime = 0;
        entry.trackLast = -1;
        entry.nextTrackLast = -1;
        entry.trackEnd = Number.MAX_VALUE;
        entry.timeScale = 1;
        entry.alpha = 1;
        entry.interruptAlpha = 1;
        entry.mixTime = 0;
        entry.mixDuration = last == null ? 0 : this.data.getMix(last.animation, animation);
        return entry;
    }
    disposeNext(entry) {
        let next = entry.next;
        while (next != null) {
            this.queue.dispose(next);
            next = next.next;
        }
        entry.next = null;
    }
    _animationsChanged() {
        this.animationsChanged = false;
        this.propertyIDs.clear();
        for (let i = 0, n = this.tracks.length; i < n; i++) {
            let entry = this.tracks[i];
            if (entry == null)
                continue;
            while (entry.mixingFrom != null)
                entry = entry.mixingFrom;
            do {
                if (entry.mixingFrom == null || entry.mixBlend != Animation_1.MixBlend.add)
                    this.setTimelineModes(entry);
                entry = entry.mixingTo;
            } while (entry != null);
        }
    }
    setTimelineModes(entry) {
        let to = entry.mixingTo;
        let timelines = entry.animation.timelines;
        let timelinesCount = entry.animation.timelines.length;
        let timelineMode = Utils_1.Utils.setArraySize(entry.timelineMode, timelinesCount);
        entry.timelineHoldMix.length = 0;
        let timelineDipMix = Utils_1.Utils.setArraySize(entry.timelineHoldMix, timelinesCount);
        let propertyIDs = this.propertyIDs;
        if (to != null && to.holdPrevious) {
            for (let i = 0; i < timelinesCount; i++) {
                propertyIDs.add(timelines[i].getPropertyId());
                timelineMode[i] = AnimationState.HOLD;
            }
            return;
        }
        outer: for (let i = 0; i < timelinesCount; i++) {
            let id = timelines[i].getPropertyId();
            if (!propertyIDs.add(id))
                timelineMode[i] = AnimationState.SUBSEQUENT;
            else if (to == null || !this.hasTimeline(to, id))
                timelineMode[i] = AnimationState.FIRST;
            else {
                for (let next = to.mixingTo; next != null; next = next.mixingTo) {
                    if (this.hasTimeline(next, id))
                        continue;
                    if (entry.mixDuration > 0) {
                        timelineMode[i] = AnimationState.HOLD_MIX;
                        timelineDipMix[i] = next;
                        continue outer;
                    }
                    break;
                }
                timelineMode[i] = AnimationState.HOLD;
            }
        }
    }
    hasTimeline(entry, id) {
        let timelines = entry.animation.timelines;
        for (let i = 0, n = timelines.length; i < n; i++)
            if (timelines[i].getPropertyId() == id)
                return true;
        return false;
    }
    getCurrent(trackIndex) {
        if (trackIndex >= this.tracks.length)
            return null;
        return this.tracks[trackIndex];
    }
    addListener(listener) {
        if (listener == null)
            throw new Error("listener cannot be null.");
        this.listeners.push(listener);
    }
    /** Removes the listener added with {@link #addListener(AnimationStateListener)}. */
    removeListener(listener) {
        let index = this.listeners.indexOf(listener);
        if (index >= 0)
            this.listeners.splice(index, 1);
    }
    clearListeners() {
        this.listeners.length = 0;
    }
    clearListenerNotifications() {
        this.queue.clear();
    }
    setAnimationByName(trackIndex, animationName, loop) {
        if (!AnimationState.deprecatedWarning1) {
            AnimationState.deprecatedWarning1 = true;
            console.warn("Spine Deprecation Warning: AnimationState.setAnimationByName is deprecated, please use setAnimation from now on.");
        }
        this.setAnimation(trackIndex, animationName, loop);
    }
    addAnimationByName(trackIndex, animationName, loop, delay) {
        if (!AnimationState.deprecatedWarning2) {
            AnimationState.deprecatedWarning2 = true;
            console.warn("Spine Deprecation Warning: AnimationState.addAnimationByName is deprecated, please use addAnimation from now on.");
        }
        this.addAnimation(trackIndex, animationName, loop, delay);
    }
    hasAnimation(animationName) {
        let animation = this.data.skeletonData.findAnimation(animationName);
        return animation !== null;
    }
    hasAnimationByName(animationName) {
        if (!AnimationState.deprecatedWarning3) {
            AnimationState.deprecatedWarning3 = true;
            console.warn("Spine Deprecation Warning: AnimationState.hasAnimationByName is deprecated, please use hasAnimation from now on.");
        }
        return this.hasAnimation(animationName);
    }
}
AnimationState.emptyAnimation = new Animation_1.Animation("<empty>", [], 0);
AnimationState.SUBSEQUENT = 0;
AnimationState.FIRST = 1;
AnimationState.HOLD = 2;
AnimationState.HOLD_MIX = 3;
AnimationState.deprecatedWarning1 = false;
AnimationState.deprecatedWarning2 = false;
AnimationState.deprecatedWarning3 = false;
exports.AnimationState = AnimationState;
class TrackEntry {
    constructor() {
        this.mixBlend = Animation_1.MixBlend.replace;
        this.timelineMode = new Array();
        this.timelineHoldMix = new Array();
        this.timelinesRotation = new Array();
    }
    reset() {
        this.next = null;
        this.mixingFrom = null;
        this.mixingTo = null;
        this.animation = null;
        this.listener = null;
        this.timelineMode.length = 0;
        this.timelineHoldMix.length = 0;
        this.timelinesRotation.length = 0;
    }
    getAnimationTime() {
        if (this.loop) {
            let duration = this.animationEnd - this.animationStart;
            if (duration == 0)
                return this.animationStart;
            return (this.trackTime % duration) + this.animationStart;
        }
        return Math.min(this.trackTime + this.animationStart, this.animationEnd);
    }
    setAnimationLast(animationLast) {
        this.animationLast = animationLast;
        this.nextAnimationLast = animationLast;
    }
    isComplete() {
        return this.trackTime >= this.animationEnd - this.animationStart;
    }
    resetRotationDirections() {
        this.timelinesRotation.length = 0;
    }
    get time() {
        if (!TrackEntry.deprecatedWarning1) {
            TrackEntry.deprecatedWarning1 = true;
            console.warn("Spine Deprecation Warning: TrackEntry.time is deprecated, please use trackTime from now on.");
        }
        return this.trackTime;
    }
    set time(value) {
        if (!TrackEntry.deprecatedWarning1) {
            TrackEntry.deprecatedWarning1 = true;
            console.warn("Spine Deprecation Warning: TrackEntry.time is deprecated, please use trackTime from now on.");
        }
        this.trackTime = value;
    }
    get endTime() {
        if (!TrackEntry.deprecatedWarning2) {
            TrackEntry.deprecatedWarning2 = true;
            console.warn("Spine Deprecation Warning: TrackEntry.endTime is deprecated, please use trackEnd from now on.");
        }
        return this.trackTime;
    }
    set endTime(value) {
        if (!TrackEntry.deprecatedWarning2) {
            TrackEntry.deprecatedWarning2 = true;
            console.warn("Spine Deprecation Warning: TrackEntry.endTime is deprecated, please use trackEnd from now on.");
        }
        this.trackTime = value;
    }
    loopsCount() {
        return Math.floor(this.trackTime / this.trackEnd);
    }
}
TrackEntry.deprecatedWarning1 = false;
TrackEntry.deprecatedWarning2 = false;
exports.TrackEntry = TrackEntry;
class EventQueue {
    constructor(animState) {
        this.objects = [];
        this.drainDisabled = false;
        this.animState = animState;
    }
    start(entry) {
        this.objects.push(EventType.start);
        this.objects.push(entry);
        this.animState.animationsChanged = true;
    }
    interrupt(entry) {
        this.objects.push(EventType.interrupt);
        this.objects.push(entry);
    }
    end(entry) {
        this.objects.push(EventType.end);
        this.objects.push(entry);
        this.animState.animationsChanged = true;
    }
    dispose(entry) {
        this.objects.push(EventType.dispose);
        this.objects.push(entry);
    }
    complete(entry) {
        this.objects.push(EventType.complete);
        this.objects.push(entry);
    }
    event(entry, event) {
        this.objects.push(EventType.event);
        this.objects.push(entry);
        this.objects.push(event);
    }
    deprecateStuff() {
        if (!EventQueue.deprecatedWarning1) {
            EventQueue.deprecatedWarning1 = true;
            console.warn("Spine Deprecation Warning: onComplete, onStart, onEnd, onEvent art deprecated, please use listeners from now on. 'state.addListener({ complete: function(track, event) { } })'");
        }
        return true;
    }
    drain() {
        if (this.drainDisabled)
            return;
        this.drainDisabled = true;
        let objects = this.objects;
        let listeners = this.animState.listeners;
        for (let i = 0; i < objects.length; i += 2) {
            let type = objects[i];
            let entry = objects[i + 1];
            switch (type) {
                case EventType.start:
                    if (entry.listener != null && entry.listener.start)
                        entry.listener.start(entry);
                    for (let ii = 0; ii < listeners.length; ii++)
                        if (listeners[ii].start)
                            listeners[ii].start(entry);
                    //deprecation
                    entry.onStart && this.deprecateStuff() && entry.onStart(entry.trackIndex);
                    this.animState.onStart && this.deprecateStuff() && this.deprecateStuff && this.animState.onStart(entry.trackIndex);
                    break;
                case EventType.interrupt:
                    if (entry.listener != null && entry.listener.interrupt)
                        entry.listener.interrupt(entry);
                    for (let ii = 0; ii < listeners.length; ii++)
                        if (listeners[ii].interrupt)
                            listeners[ii].interrupt(entry);
                    break;
                case EventType.end:
                    if (entry.listener != null && entry.listener.end)
                        entry.listener.end(entry);
                    for (let ii = 0; ii < listeners.length; ii++)
                        if (listeners[ii].end)
                            listeners[ii].end(entry);
                    //deprecation
                    entry.onEnd && this.deprecateStuff() && entry.onEnd(entry.trackIndex);
                    this.animState.onEnd && this.deprecateStuff() && this.animState.onEnd(entry.trackIndex);
                // Fall through.
                case EventType.dispose:
                    if (entry.listener != null && entry.listener.dispose)
                        entry.listener.dispose(entry);
                    for (let ii = 0; ii < listeners.length; ii++)
                        if (listeners[ii].dispose)
                            listeners[ii].dispose(entry);
                    this.animState.trackEntryPool.free(entry);
                    break;
                case EventType.complete:
                    if (entry.listener != null && entry.listener.complete)
                        entry.listener.complete(entry);
                    for (let ii = 0; ii < listeners.length; ii++)
                        if (listeners[ii].complete)
                            listeners[ii].complete(entry);
                    //deprecation
                    let count = Utils_1.MathUtils.toInt(entry.loopsCount());
                    entry.onComplete && this.deprecateStuff() && entry.onComplete(entry.trackIndex, count);
                    this.animState.onComplete && this.deprecateStuff() && this.animState.onComplete(entry.trackIndex, count);
                    break;
                case EventType.event:
                    let event = objects[i++ + 2];
                    if (entry.listener != null && entry.listener.event)
                        entry.listener.event(entry, event);
                    for (let ii = 0; ii < listeners.length; ii++)
                        if (listeners[ii].event)
                            listeners[ii].event(entry, event);
                    //deprecation
                    entry.onEvent && this.deprecateStuff() && entry.onEvent(entry.trackIndex, event);
                    this.animState.onEvent && this.deprecateStuff() && this.animState.onEvent(entry.trackIndex, event);
                    break;
            }
        }
        this.clear();
        this.drainDisabled = false;
    }
    clear() {
        this.objects.length = 0;
    }
}
EventQueue.deprecatedWarning1 = false;
exports.EventQueue = EventQueue;
var EventType;
(function (EventType) {
    EventType[EventType["start"] = 0] = "start";
    EventType[EventType["interrupt"] = 1] = "interrupt";
    EventType[EventType["end"] = 2] = "end";
    EventType[EventType["dispose"] = 3] = "dispose";
    EventType[EventType["complete"] = 4] = "complete";
    EventType[EventType["event"] = 5] = "event";
})(EventType = exports.EventType || (exports.EventType = {}));
class AnimationStateAdapter2 {
    start(entry) {
    }
    interrupt(entry) {
    }
    end(entry) {
    }
    dispose(entry) {
    }
    complete(entry) {
    }
    event(entry, event) {
    }
}
exports.AnimationStateAdapter2 = AnimationStateAdapter2;
