export default class Text {

    #draggingStartPosition = {x: 0, y: 0};

    #offsetTextToTopBorder = 0;
    #offsetTextToRightBorder = 0;
    #offsetTextToBottomBorder = 0;
    #offsetTextToLeftBorder = 0;

    #prevOffsetX = 0;
    #prevOffsetY = 0;

    textStartX = 0;
    textStartY = 0;

    rotationAngleDeg = 0;

    isHovered = false;
    isDragging = false;


    get textLines() {
        const lines = this.str.split("\n");

        const resultLines = [];

        for (const line of lines) {
            resultLines.push(...getLines(this.context, line, this.textStyle, this.maxWidth));
        }

        return resultLines;
    }

    get borderTopLeft() {
        return {
            x: this.totalTextStart.x,
            y: this.totalTextStart.y
        };
    }

    get borderTopRight() {
        return {
            x: this.textStartX + this.totalTextWidth + this.#offsetTextToRightBorder,
            y: this.borderTopLeft.y
        };
    }

    get borderBottomLeft() {
        return {
            x: this.borderTopLeft.x,
            y: this.borderTopLeft.y + this.totalTextBoxHeight
        };
    }

    get borderBottomRight() {
        return {
            x: this.borderTopRight.x,
            y: this.borderBottomLeft.y
        };
    };

    get totalTextStart() {
        return {
            x: this.textStartX + this.#offsetTextToLeftBorder,
            y: this.textStartY + this.#offsetTextToTopBorder
        };
    }

    get totalTextWidth() {
        return this.textWidth;
    }

    get totalTextHeight() {
        const linesAmount = this.textLines.length;
        return this.textHeight * linesAmount + this.distanceBetweenLines * Math.max(0, linesAmount - 1);
    }

    get totalTextBoxWidth() {
        return -this.#offsetTextToLeftBorder + this.totalTextWidth + this.#offsetTextToRightBorder;
    }

    get totalTextBoxHeight() {
        return Math.floor(3 / 2 * this.totalTextHeight) + this.#offsetTextToBottomBorder - this.#offsetTextToTopBorder;
    }


    /**
     *
     * @returns {number}
     */
    get textWidth() {
        this.context.save();

        this.applyTextStyle(this.textStyle);

        let maxWidth = 0;

        for (const line of this.textLines) {
            const lineWidth = this.context.measureText(line).width;
            if (lineWidth > maxWidth) {
                maxWidth = lineWidth;
            }
        }

        this.context.restore();

        return maxWidth;
    }

    /**
     *
     * @returns {number}
     */
    get textHeight() {
        this.context.save();

        // this.context.font = `${this.textStyle.fontSize}px fantasy`;
        this.context.font = `${this.textStyle.fontSize}px ${this.textStyle.fontName}`;
        const height = this.context.measureText("M").width * 1.3;

        this.context.restore();

        return height;
    }

    get distanceBetweenLines() {
        return Math.ceil(this.textHeight / 15);
    }

    /**
     *
     * @param {CanvasRenderingContext2D} context
     * @param {number} x
     * @param {number} y
     * @param maxWidth
     * @param maxHeight
     * @param {string} str
     * @param {TextStyle} textStyle
     */
    constructor(context, x, y, maxWidth, maxHeight, str, textStyle) {
        this.context = context;

        this.textStartX = x;
        this.textStartY = y;

        this.maxWidth = maxWidth;

        this.str = str;
        this.textStyle = textStyle;

        this.initHovers();
    }

    applyTextStyle(textStyle) {
        this.textStyle = textStyle;

        const textSize = `${textStyle.fontSize}px`;

        this.context.font = [textStyle.bold, textStyle.italic, textSize, textStyle.fontName].join(" ");

        const [r, g, b] = hexToRgb(textStyle.textColorHex);

        this.context.fillStyle = this.context.strokeStyle = `rgba(${r}, ${g}, ${b}, ${textStyle.textAlpha})`;
    }

    initHovers() {
        this.hover = false;
        this.hoverTop = false;
        this.hoverRight = false;
        this.hoverBottom = false;
        this.hoverLeft = false;
    }

    onMouseMove(x, y) {
        this.updateHovers(x, y);
    }

    onMouseDown(x, y) {
        this.isDragging = true;

        this.#draggingStartPosition = {
            x: x,
            y: y
        };
    }

    onMouseUp(x, y) {
        this.isDragging = false;
        this.saveDragging();
    }

    onClick(x, y) {
        this.isDragging = false;
    }

    /**
     *
     * @param x
     * @param y
     * @returns {boolean} true if mouse hovers the box of the text
     */
    updateHovers(x, y) {
        if (this.isDragging) {
            this.processHovers(x, y);
            return true;
        }

        this.hoverTop =
            this.borderTopLeft.x <= x + 2
            && x <= this.borderTopRight.x + 2
            && Math.abs(y - this.borderTopLeft.y) <= 2;

        this.hoverRight =
            Math.abs(x - this.borderTopRight.x) <= 2
            && this.borderTopRight.y <= y + 2
            && y <= this.borderBottomRight.y + 2;

        this.hoverBottom =
            this.borderBottomLeft.x <= x + 2
            && x <= this.borderBottomRight.x + 2
            && Math.abs(y - this.borderBottomLeft.y) <= 2;

        this.hoverLeft =
            Math.abs(x - this.borderTopLeft.x) <= 2
            && this.borderTopLeft.y <= y + 2
            && y <= this.borderBottomLeft.y + 2;

        let hoverShape = this.borderTopLeft.x - 2 <= x
            && x <= this.borderTopRight.x + 2
            && y >= this.borderTopLeft.y - 2
            && this.borderBottomLeft.y >= y + 2;

        this.hover = hoverShape && !(this.hoverTop || this.hoverRight || this.hoverBottom || this.hoverLeft);

        this.isHovered = this.hover || this.hoverTop || this.hoverRight || this.hoverBottom || this.hoverLeft;

        this.processHovers(x, y);

        return this.isHovered;
    }

    drawText() {
        this.context.save();

        this.applyTextStyle(this.textStyle);

        const x = this.totalTextStart.x;
        const y = this.totalTextStart.y + this.textHeight;

        this.applyRotation();

        if (this.isHovered) {
            this.drawBorders();
        }

        if (this.textStyle.hasBackground) {
            this.fillBackground();
        }

        if (this.textStyle.isUnderline) {
            this.drawUnderlines(x, y);
        }

        this.drawLines(x, y);

        this.context.restore();
    }

    drawUnderlines(x, y) {
        const thickness = Math.ceil(this.textHeight / 12);
        const lineHeight = this.textHeight;

        for (const line of this.textLines) {
            const lineWidth = this.context.measureText(line).width;

            const lineStartX = this.getLineStartX(x, line);

            this.context.fillRect(lineStartX, y + 1 + thickness * 2, lineWidth, thickness);
            y += lineHeight + this.distanceBetweenLines;
        }
    }

    drawLines(x, y) {
        const lineHeight = this.textHeight;

        for (const line of this.textLines) {

            let lineStartX = this.getLineStartX(x, line);

            if (this.textStyle.isStroke) {
                this.context.save();

                this.context.lineWidth = this.textStyle.fontSize / 10;
                this.context.strokeText(line, lineStartX, y);

                this.context.fillStyle = "white";
                this.context.fillText(line, lineStartX, y);

                this.context.restore();
            } else {
                this.context.fillText(line, lineStartX, y);
            }

            y += lineHeight + this.distanceBetweenLines;
        }
    }

    getLineStartX(x, line) {
        const lineWidth = this.context.measureText(line).width;

        let lineStartX = x;

        switch (this.textStyle.textAlignment) {
            case "start":
                break;

            case "center":
                const centerOfTextBoxX = (this.borderBottomLeft.x + this.borderTopRight.x) / 2;
                lineStartX = centerOfTextBoxX - lineWidth / 2;
                break;

            case "end":
                const dx = this.totalTextBoxWidth - lineWidth;
                lineStartX += dx;
                break;
        }

        return lineStartX;
    }

    drawRealBorders() {
        const realWidth = this.borderTopRight.x - this.borderTopLeft.x;
        const realHeight = this.borderBottomLeft.y - this.borderTopLeft.y;
        this.context.strokeRect(this.borderTopLeft.x, this.borderTopLeft.y, realWidth, realHeight);
    }

    applyRotation() {
        this.context.translate(this.textStartX + this.totalTextBoxWidth / 2, this.textStartY + this.totalTextHeight / 2);
        this.context.rotate((this.rotationAngleDeg * Math.PI) / 180);
        this.context.translate(-(this.textStartX + this.totalTextBoxWidth / 2), -(this.textStartY + this.totalTextHeight / 2));
    }

    checkHoverShape(x, y) {
        return this.isInside(
            [x, y],
            [[this.borderTopLeft.x, this.borderTopLeft.y],
                [this.borderTopRight.x, this.borderTopRight.y],
                [this.borderBottomLeft.x, this.borderBottomLeft.y],
                [this.borderBottomRight.x, this.borderBottomRight.y]]
        );
    }

    isInside(point, shape) {
        const x = point[0];
        const y = point[1];

        let inside = false;

        let i = 0, j = shape.length - 1;
        for (; i < shape.length; j = i++) {
            const xi = shape[i][0], yi = shape[i][1];
            const xj = shape[j][0], yj = shape[j][1];

            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

            if (intersect) {
                inside = !inside;
            }
        }

        return inside;
    };

    drawBorders() {
        this.applyTextStyle(this.textStyle);

        this.context.save();

        const width = this.totalTextBoxWidth;
        const height = this.totalTextBoxHeight;

        const x = this.totalTextStart.x;
        const y = this.totalTextStart.y;

        this.context.fillStyle = this.context.strokeStyle = "gray";

        this.context.strokeRect(x, y, width, Math.floor(height));

        this.context.restore();
    }

    fillBackground() {
        const width = this.totalTextBoxWidth;
        const height = this.totalTextBoxHeight;

        const x = this.totalTextStart.x;
        const y = this.totalTextStart.y;

        const [r, g, b] = hexToRgb(this.textStyle.textBackgroundColorHex);

        this.context.save();

        this.context.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.textStyle.textBackgroundAlpha})`;

        this.context.fillRect(x, y, width, Math.floor(height));

        this.context.restore();
    }

    processHovers(x, y) {
        if (this.hoverTop) {
            if (this.hoverLeft) {
                this.onHoverTopLeft(x, y);
            } else if (this.hoverRight) {
                this.onHoverTopRight(x, y);
            } else {
                this.onHoverTop(x, y);
            }
        } else if (this.hoverBottom) {
            if (this.hoverLeft) {
                this.onHoverBottomLeft(x, y);
            } else if (this.hoverRight) {
                this.onHoverBottomRight(x, y);
            } else {
                this.onHoverBottom(x, y);
            }
        } else if (this.hoverLeft) {
            this.onHoverLeft(x, y);
        } else if (this.hoverRight) {
            this.onHoverRight(x, y);
        } else if (this.hover) {
            this.onHover(x, y);
        } else {
            this.onNoHover(x, y);
        }
    }

    onHover(x, y) {
        document.body.style.cursor = "move";

        if (this.isDragging) {
            const offsetX = x - this.#draggingStartPosition.x;
            const offsetY = y - this.#draggingStartPosition.y;

            const dx = offsetX - this.#prevOffsetX;
            const dy = offsetY - this.#prevOffsetY;

            this.#prevOffsetX = offsetX;
            this.#prevOffsetY = offsetY;

            this.textStartX += dx;
            this.textStartY += dy;
        }
    }

    onNoHover(x, y) {
        document.body.style.cursor = "default";
    }

    onHoverTopLeft(x, y) {
        document.body.style.cursor = "nw-resize";

        if (this.isDragging) {
            this.onHoverLeft(x, y);
            this.onHoverTop(x, y);
        }
    }

    onHoverTopRight(x, y) {
        document.body.style.cursor = "ne-resize";

        if (this.isDragging) {
            this.onHoverRight(x, y);
            this.onHoverTop(x, y);
        }
    }

    onHoverBottomLeft(x, y) {
        document.body.style.cursor = "ne-resize";

        if (this.isDragging) {
            this.onHoverLeft(x, y);
            this.onHoverBottom(x, y);
        }
    }

    onHoverBottomRight(x, y) {
        document.body.style.cursor = "nw-resize";

        if (this.isDragging) {
            this.onHoverRight(x, y);
            this.onHoverBottom(x, y);
        }
    }

    onHoverTop(x, y) {
        document.body.style.cursor = "n-resize";

        if (this.isDragging) {
            const offset = y - this.#draggingStartPosition.y;
            const dy = offset - this.#prevOffsetY;

            this.#prevOffsetY = offset;

            this.#offsetTextToTopBorder += dy;
        }
    }


    onHoverRight(x, y) {
        document.body.style.cursor = "e-resize";

        if (this.isDragging) {
            const offset = x - this.#draggingStartPosition.x;
            const dx = offset - this.#prevOffsetX;

            this.#prevOffsetX = offset;

            this.#offsetTextToRightBorder += dx;
            this.maxWidth += dx;
        }
    }

    onHoverBottom(x, y) {
        document.body.style.cursor = "n-resize";

        if (this.isDragging) {
            const offset = y - this.#draggingStartPosition.y;
            const dy = offset - this.#prevOffsetY;

            this.#prevOffsetY = offset;

            this.#offsetTextToBottomBorder += dy;
        }
    }

    onHoverLeft(x, y) {
        document.body.style.cursor = "w-resize";

        if (this.isDragging) {
            const offset = x - this.#draggingStartPosition.x;
            const dx = offset - this.#prevOffsetX;

            this.#prevOffsetX = offset;

            this.#offsetTextToLeftBorder += dx;
            this.maxWidth += dx;
        }
    }

    saveDragging() {
        this.#prevOffsetX = 0;
        this.#prevOffsetY = 0;
    }
}

function rotatePoint(cx, cy, x, y, angleDeg) {
    const angleRad = Math.PI * angleDeg / 180;

    const tempX = x - cx;
    const tempY = y - cy;

    const rotatedX = tempX * Math.cos(angleRad) - tempY * Math.sin(angleRad);
    const rotatedY = tempX * Math.sin(angleRad) + tempY * Math.cos(angleRad);

    return {
        x: rotatedX + cx,
        y: rotatedY + cy
    };
}

function hexToRgb(hex) {
    if (hex[0] === '#') {
        hex = hex.slice(1);
    }

    const arrBuff = new ArrayBuffer(4);
    const vw = new DataView(arrBuff);
    vw.setUint32(0, parseInt(hex, 16), false);
    const arrByte = new Uint8Array(arrBuff);

    return [arrByte[1], arrByte[2], arrByte[3]];
}

function getLines(ctx, text, textStyle, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = words[0];

    ctx.save();

    const textSize = `${textStyle.fontSize}px`;

    ctx.font = [textStyle.bold, textStyle.italic, textSize, textStyle.fontName].join(" ");

    const [r, g, b] = hexToRgb(textStyle.textColorHex);

    ctx.fillStyle = ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${textStyle.textAlpha})`;


    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);

    ctx.restore();

    return lines;
}
