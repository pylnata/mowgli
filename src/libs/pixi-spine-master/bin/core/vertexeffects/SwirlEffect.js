"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("../Utils");
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
class SwirlEffect {
    constructor(radius) {
        this.centerX = 0;
        this.centerY = 0;
        this.radius = 0;
        this.angle = 0;
        this.worldX = 0;
        this.worldY = 0;
        this.radius = radius;
    }
    begin(skeleton) {
        this.worldX = skeleton.x + this.centerX;
        this.worldY = skeleton.y + this.centerY;
    }
    transform(position, uv, light, dark) {
        let radAngle = this.angle * Utils_1.MathUtils.degreesToRadians;
        let x = position.x - this.worldX;
        let y = position.y - this.worldY;
        let dist = Math.sqrt(x * x + y * y);
        if (dist < this.radius) {
            let theta = SwirlEffect.interpolation.apply(0, radAngle, (this.radius - dist) / this.radius);
            let cos = Math.cos(theta);
            let sin = Math.sin(theta);
            position.x = cos * x - sin * y + this.worldX;
            position.y = sin * x + cos * y + this.worldY;
        }
    }
    end() {
    }
}
SwirlEffect.interpolation = new Utils_1.PowOut(2);
exports.SwirlEffect = SwirlEffect;
