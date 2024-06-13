import TextStyle from "./TextStyle.js";
import Text from "./Text.js";
import {memes} from "./memes.js";

const addTextElement = document.querySelector(".screen .text .add-text");
const removeTextElement = document.querySelector(".screen .text .remove-text");
const textInput = document.querySelector(".screen .text-input");

const textAlignmentButton = document.querySelector(".screen .text-alignment-button");
const selectedAlignment = document.querySelector(".screen .text-alignment .selected-alignment");
const textAlignmentOptions = document.querySelector(".screen .text-alignment-options");
const alignmentOptions = document.querySelectorAll(".screen .options .text-alignment-options img");


const rotationButton = document.querySelector(".text-rotation .data");
const rotationDropdown = document.querySelector(".text-rotation .rotation");
const rotationSlider = document.querySelector(".text-rotation .slider");
const rotationInput = document.querySelector(".text-rotation .rotation .rotation-input");

const textSizeButton = document.querySelector(".options .text-size .text-size-button");
const textSizeInput = document.querySelector(".options .text-size .input");

const textAppearanceOptions = document.querySelectorAll(".options .text-appearance i");

const textColorButton = document.querySelector(".text-color u");
const textStrokeButton = document.querySelector(".text-stroke img");
const textColorInput = document.querySelector(".text-color input");

const textAlphaButton = document.querySelector(".text-alpha .data");
const textAlphaDropdown = document.querySelector(".text-alpha .alpha-dropdown");
const textAlphaSlider = document.querySelector(".text-alpha .slider");
const textAlphaPercentValue = document.querySelector(".text-alpha .value");

const fontDropDownMenuArrow = document.querySelector(".text-font-menu #arrow");
const fontsList = document.querySelector(".text-font-menu .dropdown");

const currentFontElement = document.querySelector(".text-font-menu .selected-font");
const currentFontText = document.querySelector(".text-font-menu .current-font");

const hasTextBackgroundElement = document.querySelector(".text-background .has-text-background");
const textBackgroundOptionsElement = document.querySelector(".text-background .options");
const textBackgroundColorInput = document.querySelector(".text-background-color input");

const textBackgroundButton = document.querySelector(".text-background .button");
const textBackgroundAlphaButton = document.querySelector(".text-background .options .alpha .data");
const textBackgroundAlphaDropdown = document.querySelector(".text-background .options .alpha .alpha-dropdown");
const textBackgroundAlphaSlider = document.querySelector(".text-background .options .alpha input");
const textBackgroundAlphaPercentValue = document.querySelector(".text-background .options .alpha .value");

const canvas = document.querySelector(".screen canvas");

const fileInput = document.querySelector(".file-input");

const generateMemeBtn = document.querySelector(".generate-meme");
const chooseImgBtn = document.querySelector(".choose-img");
const saveImgBtn = document.querySelector(".save-img");

const jasonGalleryImages = document.querySelectorAll(".jason-gallery img");

let selectedImage = null;

const ctx = canvas.getContext("2d");

let textRotationAngleDeg = 0;

ctx.direction = "ltr";

let hoveredText = null;
let draggedText = null;

const x = 50;
const y = 100;

const maxImageWidth = 500;

const textStyle1 = new TextStyle(false, false, false,
    48, "center", "cursive",
    "#000000",
    "#8F8F8F",
    1, 1, false, true);

const text = new Text(ctx, x, y, 200, 50, "Введите текст1", textStyle1);

const textStyle2 = new TextStyle(false, false, false,
    48, "center", "cursive",
    "#000000",
    "#8F8F8F",
    1, 1, false, true);

const text2 = new Text(ctx, x + 50, y + 30, 200, 50, "Введите текст2", textStyle2);

let textsList = [text, text2];

let selectedText = text;

fileInput.addEventListener("change", () => {
    loadImage();
    redraw();
});

function generateRandomMeme() {
    const randomImageIndex = Math.floor(Math.random() * (jasonGalleryImages.length));
    const randomImage = jasonGalleryImages[randomImageIndex];

    const randomMemeIndex = Math.floor(Math.random() * (memes.length));
    const randomMeme = memes[randomMemeIndex];

    const splitedMeme = randomMeme.split(" (c) ");

    const text1 = textsList[0];
    const text2 = textsList[1];

    text1.str = splitedMeme[0];
    text2.str = splitedMeme[1];

    const resizedImageDimensions = getResizedImageDimensions(selectedImage, maxImageWidth);

    text1.textStyle.fontSize = text2.textStyle.fontSize = resizedImageDimensions.width / 15;

    selectImage(randomImage, text1, text2);
    selectText(text1);

    redraw();
}

generateMemeBtn.addEventListener("click", () => {
    generateRandomMeme();
});

function selectImage(image, text1, text2) {
    selectedImage = image;

    const resizedImageDimensions = getResizedImageDimensions(image, maxImageWidth);

    text1.maxWidth = text2.maxWidth = resizedImageDimensions.width * 0.8;
    text1.maxHeight = text2.maxHeight = resizedImageDimensions.height;

    text1.x = text1.textStartX = resizedImageDimensions.width / 2 - text1.totalTextWidth / 2;
    text1.y = text1.textStartY = 0.1 * resizedImageDimensions.height;

    text2.x = text2.textStartX = resizedImageDimensions.width / 2 - text2.totalTextWidth / 2;
    text2.y = text2.textStartY = 0.9 * resizedImageDimensions.height - text2.totalTextHeight;
}

chooseImgBtn.addEventListener("click", () => {
    fileInput.click();
    redraw();
});

canvas.addEventListener("mousemove", onMouseMove);
canvas.addEventListener("mousedown", onMouseDown);
canvas.addEventListener("mouseup", onMouseUp);
canvas.addEventListener("click", onClick);

selectText(selectedText);

saveImgBtn.addEventListener("click", downloadImage);

selectImage(jasonGalleryImages[0], textsList[0], textsList[1]);


jasonGalleryImages.forEach(image => {
    image.addEventListener("click", () => {
        selectImage(image, textsList[0], textsList[1]);
        redraw();
    });
});

function downloadImage() {
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = canvas.toDataURL();
    link.click();
}

function loadImage() {
    let file = fileInput.files[0];

    if (!file) {
        return;
    }

    selectedImage.src = URL.createObjectURL(file);

    selectImage(selectedImage, textsList[0], textsList[1]);
    setTimeout(redraw, 10);
}

function onMouseMove(e) {
    const r = canvas.getBoundingClientRect();

    let x = e.clientX - r.left;
    let y = e.clientY - r.top;

    hoveredText = null;

    const draggedTexts = textsList.filter(t => t.isDragging);

    if (draggedTexts.length !== 0) {
        draggedText = draggedTexts[0];
        hoveredText = draggedText;
    } else {
        draggedText = null;
    }

    for (const text of textsList) {
        text.onMouseMove(x, y);

        if (draggedText === null && text.isHovered) {
            hoveredText = text;
            break;
        }
    }

    redraw();
}

function onMouseDown(e) {
    const r = canvas.getBoundingClientRect();
    let x = e.clientX - r.left;
    let y = e.clientY - r.top;

    if (hoveredText !== null) {
        selectText(hoveredText);
        hoveredText.onMouseDown(x, y);
    }
}

function onMouseUp(e) {
    const r = canvas.getBoundingClientRect();

    let x = e.clientX - r.left;
    let y = e.clientY - r.top;

    if (hoveredText !== null) {
        hoveredText.onMouseUp(x, y);
    }
}

function onClick(e) {
    const r = canvas.getBoundingClientRect();

    let x = e.clientX - r.left;
    let y = e.clientY - r.top;

    if (hoveredText !== null) {
        hoveredText.onClick(x, y);
    }
}

/**
 *
 * @param {Text} text
 */
function selectText(text) {
    selectedText = text;

    textInput.value = selectedText.str;

    const style = selectedText.textStyle;

    textSizeInput.value = style.fontSize;
    currentFontText.innerHTML = style.fontName;
    textColorInput.value = style.textColorHex;

    textColorButton.style.color = style.textColorHex[0] === "#" ? "" : "#" + style.textColorHex;

    textStrokeButton.src = style.isStroke
        ? "icons/icon-stroke.png"
        : "icons/icon-no-stroke.png";

    const textAlphaPercent = style.textAlpha * 100;
    textAlphaSlider.value = textAlphaPercent;
    textAlphaPercentValue.innerHTML = textAlphaPercent.toString();

    rotationSlider.value = text.rotationAngleDeg;
    rotationInput.value = text.rotationAngleDeg;

    alignmentOptions.forEach(option => {
        option.classList.remove("checked");

        if (selectedText.textStyle.textAlignment === option.id) {
            option.classList.add("checked");
            selectedAlignment.src = option.src;
        }
    });

    textAppearanceOptions.forEach(option => {
        switch (option.id) {
            case "bold":
                const isBold = selectedText.textStyle.isBold;

                if (isBold) {
                    option.classList.add("checked");
                } else {
                    option.classList.remove("checked");
                }

                break;
            case "italic":
                const isItalic = selectedText.textStyle.isItalic;

                if (isItalic) {
                    option.classList.add("checked");
                } else {
                    option.classList.remove("checked");
                }

                break;
            case "underline":
                const isUnderline = selectedText.textStyle.isUnderline;

                if (isUnderline) {
                    option.classList.add("checked");
                } else {
                    option.classList.remove("checked");
                }

                break;
        }
    });

    hasTextBackgroundElement.checked = selectedText.textStyle.hasBackground;

    textBackgroundColorInput.value = selectedText.textStyle.textBackgroundColorHex;

    const textBackgroundAlphaPercent = style.textBackgroundAlpha * 100;
    textBackgroundAlphaSlider.value = textBackgroundAlphaPercent;
    textBackgroundAlphaPercentValue.innerHTML = textBackgroundAlphaPercent.toString();

    redraw();
}

function drawImage() {
    if (selectedImage === null) {
        return;
    }

    const resizedImageDimensions = getResizedImageDimensions(selectedImage, maxImageWidth);
    ctx.canvas.width = resizedImageDimensions.width;
    ctx.canvas.height = resizedImageDimensions.height;

    ctx.drawImage(selectedImage, 0, 0, resizedImageDimensions.width, resizedImageDimensions.height);
}

function getResizedImageDimensions(image, resizeToWidth) {
    const ratio = image.width / image.height;

    const imageWidth = Math.max(selectedImage.width, resizeToWidth);

    return {
        width: imageWidth,
        height: imageWidth / ratio
    };
}

textInput.addEventListener("input", () => {
    selectedText.str = textInput.value;
    redraw();
});

function redraw() {
    if (selectedImage === null) {
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawImage();

    for (const t of textsList) {
        t.drawText();
    }
}

/**
 * @param {Text} text
 */

textInput.addEventListener("paste", () => {
    selectedText.str = (event.clipboardData || window.clipboardData).getData("text");
    redraw();
});


textAlignmentButton.addEventListener("click", () => {
    textAlignmentOptions.classList.toggle("shown");
});


alignmentOptions.forEach(option => {
    option.addEventListener("click", () => {
        selectedText.textStyle.textAlignment = option.id;

        alignmentOptions.forEach(opt => {
            opt.classList.remove("checked");
        });

        option.classList.add("checked");

        selectedAlignment.src = option.src;

        redraw();
    });
});


rotationButton.addEventListener("click", () => {
    rotationDropdown.classList.toggle("shown");
});

rotationSlider.addEventListener("input", () => {
    const angle = rotationSlider.value;

    rotationInput.value = angle;
    textRotationAngleDeg = angle;
    selectedText.rotationAngleDeg = angle;

    redraw();
});

textSizeButton.addEventListener("click", () => {
    textSizeInput.classList.toggle("shown");
});

textSizeInput.value = selectedText.textStyle.fontSize;

textSizeInput.addEventListener("input", () => {
    selectedText.textStyle.fontSize = textSizeInput.value;
    redraw();
});

textAppearanceOptions.forEach(option => {
    option.addEventListener("click", () => {
        switch (option.id) {
            case "bold":
                let isBold = selectedText.textStyle.isBold;
                selectedText.textStyle.isBold = isBold = !isBold;

                option.classList.toggle("checked");

                break;

            case "italic":
                let isItalic = selectedText.textStyle.isItalic;
                selectedText.textStyle.isItalic = isItalic = !isItalic;

                option.classList.toggle("checked");

                break;

            case "underline":
                let isUnderline = selectedText.textStyle.isUnderline;
                selectedText.textStyle.isUnderline = isUnderline = !isUnderline;

                option.classList.toggle("checked");

                break;
        }

        redraw();
    });
});

textAlphaSlider.addEventListener("input", () => {
    const alphaPercent = textAlphaSlider.value;

    textAlphaPercentValue.innerText = alphaPercent;
    selectedText.textStyle.textAlpha = alphaPercent / 100;

    redraw();
});

textStrokeButton.addEventListener("click", () => {
    const isStroke = !selectedText.textStyle.isStroke;

    selectedText.textStyle.isStroke = isStroke;

    textStrokeButton.src = isStroke
        ? "icons/icon-stroke.png"
        : "icons/icon-no-stroke.png";

    redraw();
});

textColorButton.addEventListener("click", () => {
    textColorInput.click();
});


textAlphaButton.addEventListener("click", () => {
    textAlphaDropdown.classList.toggle("shown");
});

textColorInput.addEventListener("input", () => {
    selectedText.textStyle.textColorHex = textColorInput.value.slice(1);
    textColorButton.style.color = `#${selectedText.textStyle.textColorHex}`;
    redraw();
});


currentFontElement.addEventListener("click", (e) => {
    e.stopPropagation();

    fontDropDownMenuArrow.classList.toggle("arrow");
    const currentDisplay = fontsList.style.display;

    fontsList.style.display = (currentDisplay === 'none' || currentDisplay === null || currentDisplay === "") ? 'block' : 'none';
});

const fonts = [];
init();

function init() {
    fonts.push("cursive");
    fonts.push("monospace");
    fonts.push("serif");
    fonts.push("sans-serif");
    fonts.push("fantasy");
    fonts.push("default");
    fonts.push("Arial");
    fonts.push("Arial Black");
    fonts.push("Arial Narrow");
    fonts.push("Arial Rounded MT Bold");
    fonts.push("Bookman Old Style");
    fonts.push("Bradley Hand ITC");
    fonts.push("Century");
    fonts.push("Century Gothic");
    fonts.push("Comic Sans MS");
    fonts.push("Courier");
    fonts.push("Courier New");
    fonts.push("Georgia");
    fonts.push("Gentium");
    fonts.push("Impact");
    fonts.push("King");
    fonts.push("Lucida Console");
    fonts.push("Lalit");
    fonts.push("Modena");
    fonts.push("Monotype Corsiva");
    fonts.push("Papyrus");
    fonts.push("Tahoma");
    fonts.push("TeX");
    fonts.push("Times");
    fonts.push("Times New Roman");
    fonts.push("Trebuchet MS");
    fonts.push("Verdana");
    fonts.push("Verona");
}

fonts.forEach(font => {
    const element = document.createElement("a");

    element.appendChild(document.createTextNode(font));

    element.style.fontFamily = font;

    if (font === selectedText.textStyle.fontName) {
        element.click();
    }

    fontsList.appendChild(element);
});

document.querySelectorAll(".text-font-menu .dropdown a")
    .forEach(f => {
        f.addEventListener("click", () => {
            selectFont(f.innerHTML);
        });
    });

selectFont(selectedText.textStyle.fontName);

function selectFont(font) {
    selectedText.textStyle.fontName = font;
    currentFontText.innerHTML = font;
    currentFontText.style.fontFamily = font;

    redraw();
}

textBackgroundButton.addEventListener("click", () => {
    textBackgroundOptionsElement.classList.toggle("shown");
});


hasTextBackgroundElement.addEventListener("input", () => {
    selectedText.textStyle.hasBackground = hasTextBackgroundElement.checked;
    redraw();
});


textBackgroundColorInput.addEventListener("input", () => {
    selectedText.textStyle.textBackgroundColorHex = textBackgroundColorInput.value;
    redraw();
});

textBackgroundAlphaButton.addEventListener("click", () => {
    textBackgroundAlphaDropdown.classList.toggle("shown");
});

textBackgroundAlphaSlider.addEventListener("input", () => {
    const alphaPercent = textBackgroundAlphaSlider.value;

    textBackgroundAlphaPercentValue.innerHTML = alphaPercent.toString();
    selectedText.textStyle.textBackgroundAlpha = alphaPercent / 100;

    redraw();
});


addTextElement.addEventListener("click", () => {
    const textStyle = new TextStyle(false, false, false,
        24, "start", "monospace",
        "#000000",
        "#ffffff",
        1, 1, false, false);

    const text = new Text(ctx, x, y, maxImageWidth, maxImageWidth, "Текст", textStyle);

    textsList.push(text);

    redraw();
});

removeTextElement.addEventListener("click", () => {
    if (textsList.length <= 1) {
        return;
    }

    textsList = textsList.filter(text => text !== selectedText);

    selectText(textsList[0]);
});
