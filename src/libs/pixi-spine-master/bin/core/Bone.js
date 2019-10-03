"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BoneData_1 = require("./BoneData");
const Utils_1 = require("./Utils");
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
class Bone {
    /** @param parent May be null. */
    constructor(data, skeleton, parent) {
        //be careful! Spine b,c is c,b in pixi matrix
        this.matrix = new pixi_js_1.Matrix();
        this.children = new Array();
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scaleX = 0;
        this.scaleY = 0;
        this.shearX = 0;
        this.shearY = 0;
        this.ax = 0;
        this.ay = 0;
        this.arotation = 0;
        this.ascaleX = 0;
        this.ascaleY = 0;
        this.ashearX = 0;
        this.ashearY = 0;
        this.appliedValid = false;
        this.sorted = false;
        if (data == null)
            throw new Error("data cannot be null.");
        if (skeleton == null)
            throw new Error("skeleton cannot be null.");
        this.data = data;
        this.skeleton = skeleton;
        this.parent = parent;
        this.setToSetupPose();
    }
    get worldX() {
        return this.matrix.tx;
    }
    get worldY() {
        return this.matrix.ty;
    }
    /** Same as {@link #updateWorldTransform()}. This method exists for Bone to implement {@link Updatable}. */
    update() {
        this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
    }
    /** Computes the world transform using the parent bone and this bone's local transform. */
    updateWorldTransform() {
        this.updateWorldTransformWith(this.x, this.y, this.rotation, this.scaleX, this.scaleY, this.shearX, this.shearY);
    }
    /** Computes the world transform using the parent bone and the specified local transform. */
    updateWorldTransformWith(x, y, rotation, scaleX, scaleY, shearX, shearY) {
        this.ax = x;
        this.ay = y;
        this.arotation = rotation;
        this.ascaleX = scaleX;
        this.ascaleY = scaleY;
        this.ashearX = shearX;
        this.ashearY = shearY;
        this.appliedValid = true;
        let parent = this.parent;
        let m = this.matrix;
        let sx = this.skeleton.scaleX;
        let sy = Bone.yDown ? -this.skeleton.scaleY : this.skeleton.scaleY;
        if (parent == null) { // Root bone.
            if (Bone.yDown) {
                rotation = -rotation;
                this.arotation = rotation;
            }
            let skeleton = this.skeleton;
            let rotationY = rotation + 90 + shearY;
            m.a = Utils_1.MathUtils.cosDeg(rotation + shearX) * scaleX * sx;
            m.c = Utils_1.MathUtils.cosDeg(rotationY) * scaleY * sy;
            m.b = Utils_1.MathUtils.sinDeg(rotation + shearX) * scaleX * sx;
            m.d = Utils_1.MathUtils.sinDeg(rotationY) * scaleY * sy;
            m.tx = x * sx + skeleton.x;
            m.ty = y * sy + skeleton.y;
            return;
        }
        let pa = parent.matrix.a, pb = parent.matrix.c, pc = parent.matrix.b, pd = parent.matrix.d;
        m.tx = pa * x + pb * y + parent.matrix.tx;
        m.ty = pc * x + pd * y + parent.matrix.ty;
        switch (this.data.transformMode) {
            case BoneData_1.TransformMode.Normal: {
                let rotationY = rotation + 90 + shearY;
                let la = Utils_1.MathUtils.cosDeg(rotation + shearX) * scaleX;
                let lb = Utils_1.MathUtils.cosDeg(rotationY) * scaleY;
                let lc = Utils_1.MathUtils.sinDeg(rotation + shearX) * scaleX;
                let ld = Utils_1.MathUtils.sinDeg(rotationY) * scaleY;
                m.a = pa * la + pb * lc;
                m.c = pa * lb + pb * ld;
                m.b = pc * la + pd * lc;
                m.d = pc * lb + pd * ld;
                return;
            }
            case BoneData_1.TransformMode.OnlyTranslation: {
                let rotationY = rotation + 90 + shearY;
                m.a = Utils_1.MathUtils.cosDeg(rotation + shearX) * scaleX;
                m.c = Utils_1.MathUtils.cosDeg(rotationY) * scaleY;
                m.b = Utils_1.MathUtils.sinDeg(rotation + shearX) * scaleX;
                m.d = Utils_1.MathUtils.sinDeg(rotationY) * scaleY;
                break;
            }
            case BoneData_1.TransformMode.NoRotationOrReflection: {
                let s = pa * pa + pc * pc;
                let prx = 0;
                if (s > 0.0001) {
                    s = Math.abs(pa * pd - pb * pc) / s;
                    pb = pc * s;
                    pd = pa * s;
                    prx = Math.atan2(pc, pa) * Utils_1.MathUtils.radDeg;
                }
                else {
                    pa = 0;
                    pc = 0;
                    prx = 90 - Math.atan2(pd, pb) * Utils_1.MathUtils.radDeg;
                }
                let rx = rotation + shearX - prx;
                let ry = rotation + shearY - prx + 90;
                let la = Utils_1.MathUtils.cosDeg(rx) * scaleX;
                let lb = Utils_1.MathUtils.cosDeg(ry) * scaleY;
                let lc = Utils_1.MathUtils.sinDeg(rx) * scaleX;
                let ld = Utils_1.MathUtils.sinDeg(ry) * scaleY;
                m.a = pa * la - pb * lc;
                m.c = pa * lb - pb * ld;
                m.b = pc * la + pd * lc;
                m.d = pc * lb + pd * ld;
                break;
            }
            case BoneData_1.TransformMode.NoScale:
            case BoneData_1.TransformMode.NoScaleOrReflection: {
                let cos = Utils_1.MathUtils.cosDeg(rotation);
                let sin = Utils_1.MathUtils.sinDeg(rotation);
                let za = (pa * cos + pb * sin) / sx;
                let zc = (pc * cos + pd * sin) / sy;
                let s = Math.sqrt(za * za + zc * zc);
                if (s > 0.00001)
                    s = 1 / s;
                za *= s;
                zc *= s;
                s = Math.sqrt(za * za + zc * zc);
                if (this.data.transformMode == BoneData_1.TransformMode.NoScale
                    && (pa * pd - pb * pc < 0) != (Bone.yDown ?
                        (this.skeleton.scaleX < 0 != this.skeleton.scaleY > 0) :
                        (this.skeleton.scaleX < 0 != this.skeleton.scaleY < 0)))
                    s = -s;
                let r = Math.PI / 2 + Math.atan2(zc, za);
                let zb = Math.cos(r) * s;
                let zd = Math.sin(r) * s;
                let la = Utils_1.MathUtils.cosDeg(shearX) * scaleX;
                let lb = Utils_1.MathUtils.cosDeg(90 + shearY) * scaleY;
                let lc = Utils_1.MathUtils.sinDeg(shearX) * scaleX;
                let ld = Utils_1.MathUtils.sinDeg(90 + shearY) * scaleY;
                m.a = za * la + zb * lc;
                m.c = za * lb + zb * ld;
                m.b = zc * la + zd * lc;
                m.d = zc * lb + zd * ld;
                break;
            }
        }
        m.a *= sx;
        m.c *= sx;
        m.b *= sy;
        m.d *= sy;
    }
    setToSetupPose() {
        let data = this.data;
        this.x = data.x;
        this.y = data.y;
        this.rotation = data.rotation;
        this.scaleX = data.scaleX;
        this.scaleY = data.scaleY;
        this.shearX = data.shearX;
        this.shearY = data.shearY;
    }
    getWorldRotationX() {
        return Math.atan2(this.matrix.b, this.matrix.a) * Utils_1.MathUtils.radDeg;
    }
    getWorldRotationY() {
        return Math.atan2(this.matrix.d, this.matrix.c) * Utils_1.MathUtils.radDeg;
    }
    getWorldScaleX() {
        let m = this.matrix;
        return Math.sqrt(m.a * m.a + m.c * m.c);
    }
    getWorldScaleY() {
        let m = this.matrix;
        return Math.sqrt(m.b * m.b + m.d * m.d);
    }
    /** Computes the individual applied transform values from the world transform. This can be useful to perform processing using
     * the applied transform after the world transform has been modified directly (eg, by a constraint).
     * <p>
     * Some information is ambiguous in the world transform, such as -1,-1 scale versus 180 rotation. */
    updateAppliedTransform() {
        this.appliedValid = true;
        let parent = this.parent;
        let m = this.matrix;
        if (parent == null) {
            this.ax = m.tx;
            this.ay = m.ty;
            this.arotation = Math.atan2(m.b, m.a) * Utils_1.MathUtils.radDeg;
            this.ascaleX = Math.sqrt(m.a * m.a + m.b * m.b);
            this.ascaleY = Math.sqrt(m.c * m.c + m.d * m.d);
            this.ashearX = 0;
            this.ashearY = Math.atan2(m.a * m.c + m.b * m.d, m.a * m.d - m.b * m.c) * Utils_1.MathUtils.radDeg;
            return;
        }
        let pm = parent.matrix;
        let pid = 1 / (pm.a * pm.d - pm.b * pm.c);
        let dx = m.tx - pm.tx, dy = m.ty - pm.ty;
        this.ax = (dx * pm.d * pid - dy * pm.c * pid);
        this.ay = (dy * pm.a * pid - dx * pm.b * pid);
        let ia = pid * pm.d;
        let id = pid * pm.a;
        let ib = pid * pm.c;
        let ic = pid * pm.b;
        let ra = ia * m.a - ib * m.b;
        let rb = ia * m.c - ib * m.d;
        let rc = id * m.b - ic * m.a;
        let rd = id * m.d - ic * m.c;
        this.ashearX = 0;
        this.ascaleX = Math.sqrt(ra * ra + rc * rc);
        if (this.ascaleX > 0.0001) {
            let det = ra * rd - rb * rc;
            this.ascaleY = det / this.ascaleX;
            this.ashearY = Math.atan2(ra * rb + rc * rd, det) * Utils_1.MathUtils.radDeg;
            this.arotation = Math.atan2(rc, ra) * Utils_1.MathUtils.radDeg;
        }
        else {
            this.ascaleX = 0;
            this.ascaleY = Math.sqrt(rb * rb + rd * rd);
            this.ashearY = 0;
            this.arotation = 90 - Math.atan2(rd, rb) * Utils_1.MathUtils.radDeg;
        }
    }
    worldToLocal(world) {
        let m = this.matrix;
        let a = m.a, b = m.c, c = m.b, d = m.d;
        let invDet = 1 / (a * d - b * c);
        let x = world.x - m.tx, y = world.y - m.ty;
        world.x = (x * d * invDet - y * b * invDet);
        world.y = (y * a * invDet - x * c * invDet);
        return world;
    }
    localToWorld(local) {
        let m = this.matrix;
        let x = local.x, y = local.y;
        local.x = x * m.a + y * m.c + m.tx;
        local.y = x * m.b + y * m.d + m.ty;
        return local;
    }
    worldToLocalRotation(worldRotation) {
        let sin = Utils_1.MathUtils.sinDeg(worldRotation), cos = Utils_1.MathUtils.cosDeg(worldRotation);
        let mat = this.matrix;
        return Math.atan2(mat.a * sin - mat.b * cos, mat.d * cos - mat.c * sin) * Utils_1.MathUtils.radDeg;
    }
    localToWorldRotation(localRotation) {
        let sin = Utils_1.MathUtils.sinDeg(localRotation), cos = Utils_1.MathUtils.cosDeg(localRotation);
        let mat = this.matrix;
        return Math.atan2(cos * mat.b + sin * mat.d, cos * mat.a + sin * mat.c) * Utils_1.MathUtils.radDeg;
    }
    rotateWorld(degrees) {
        let mat = this.matrix;
        let a = mat.a, b = mat.c, c = mat.b, d = mat.d;
        let cos = Utils_1.MathUtils.cosDeg(degrees), sin = Utils_1.MathUtils.sinDeg(degrees);
        mat.a = cos * a - sin * c;
        mat.c = cos * b - sin * d;
        mat.b = sin * a + cos * c;
        mat.d = sin * b + cos * d;
        this.appliedValid = false;
    }
}
Bone.yDown = false;
exports.Bone = Bone;
