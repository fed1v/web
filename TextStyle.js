export default class TextStyle {

    get bold() {
        return this.isBold
            ? "bold"
            : "";
    }

    get italic() {
        return this.isItalic
            ? "italic"
            : "";
    }

    /**
     *
     * @param {boolean} isBold
     * @param {boolean} isItalic
     * @param {boolean} isUnderline
     * @param {number} fontSize
     * @param {string} textAlignment
     * @param {string} fontName
     * @param {string} textColorHex
     * @param {string} textBackgroundColorHex
     * @param {number} textAlpha
     * @param {number} textBackgroundAlpha
     * @param {boolean} hasBackground
     * @param {boolean} isStroke
     */
    constructor(isBold, isItalic, isUnderline,
                fontSize, textAlignment, fontName,
                textColorHex, textBackgroundColorHex,
                textAlpha, textBackgroundAlpha, hasBackground, isStroke) {

        this.isBold = isBold;
        this.isItalic = isItalic;
        this.isUnderline = isUnderline;

        this.fontSize = fontSize;
        this.textAlignment = textAlignment;
        this.fontName = fontName;

        this.textColorHex = textColorHex;
        this.textBackgroundColorHex = textBackgroundColorHex;

        this.textAlpha = textAlpha;
        this.textBackgroundAlpha = textBackgroundAlpha;

        this.hasBackground = hasBackground;
        this.isStroke = isStroke;
    }
}