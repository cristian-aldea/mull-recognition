import { wasteClassMap, WasteIconMap } from "./constants";
import { ResultRef } from "./main";
import { TFJSModel } from "./tfjs.model";
import { Box, DetectionResult, Point, Size } from "./types";

let first = true;
const statusInfo = document.getElementById("status-info") as HTMLDivElement;

export const setStatusInfo = (message: any) => {
  statusInfo.textContent = message;
  if (message) {
    statusInfo.style.display = "block";
  } else {
    statusInfo.style.display = "none";
  }
};

const modal = document.getElementById("modal") as HTMLDivElement;
const icon = document.getElementById("modal-icon") as HTMLImageElement;
const title = document.getElementById("modal-title") as HTMLDivElement;
const image = document.getElementById("modal-image") as HTMLImageElement;
const description = document.getElementById("modal-description") as HTMLDivElement;

export const showModal = (object: DetectionResult, imageSrc: string) => {
  const classInfo = wasteClassMap[object.class];
  icon.src = WasteIconMap[classInfo.category].url;
  title.textContent = object.class;
  image.src = imageSrc;
  description.textContent = `This seems to be a ${capitalizeString(object.class)}. ${
    classInfo.info
  }`;
  modal.style.display = "block";
};

export const closeModal = () => {
  modal.style.display = "none";
};

export const detectFrame = async (
  video: HTMLVideoElement,
  model: TFJSModel,
  canvas: HTMLCanvasElement,
  results: ResultRef
) => {
  results.current = await model.detect(video, { numResults: 10, threshold: 0.6 });

  if (first) {
    setStatusInfo("");
    first = false;
  }
  drawDetectionIcons(canvas, results);
  requestAnimationFrame(() => {
    detectFrame(video, model, canvas, results);
  });
};

export const drawDetectionIcons = (
  canvas: HTMLCanvasElement,
  results: ResultRef,
  debug = false
) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const svgSize = Math.sqrt(canvas.width * canvas.height) / 10;

  results.current.forEach((result) => {
    const box = result.bndBox;
    const category = wasteClassMap[result.class].category;
    const dx = box.x - svgSize / 2 + box.width / 2;
    const dy = box.y - svgSize / 2 + box.height / 2;

    if (debug) {
      ctx.strokeStyle = "#00ff00";
      ctx.font = "20px Courier";
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      ctx.strokeText(`${result.class}: ${(result.confidence * 100).toFixed(1)}%`, box.x, box.y - 5);
    }

    ctx.drawImage(WasteIconMap[category].image, dx, dy, svgSize, svgSize);
  });
};

/**
 * Transforms the given canvasCoordinates to image space.
 *
 * @param canvasCoords The coordinates to transform
 * @param canvas The canvas size
 * @param image The image size
 * @returns image coordinates
 */
export const canvasToImageCoords = (canvas: Box, image: Size) => {
  const imageCoords = {
    x: 0,
    y: 0,
  };
  const canvasRatio = canvas.width / canvas.height;
  const imageRatio = image.width / image.height;

  if (canvasRatio > imageRatio) {
    // Canvas wider than image. There is padding on the sides of the image
    imageCoords.y = (canvas.y / canvas.height) * image.height;

    // Since the sides of the canvas have white padding, we need to find the offset to counterbalance this
    const trueWidth = (canvas.height / image.height) * image.width;
    const xOffset = (canvas.width - trueWidth) / 2;
    imageCoords.x = ((canvas.x - xOffset) / trueWidth) * image.width;
  } else {
    // Canvas wider than image. There is padding on the top/bottom of the image
    imageCoords.x = (canvas.x / canvas.width) * image.width;

    // Since the top/bottom of the canvas have white padding, we need to find the offset to counterbalance this
    const trueHeight = (canvas.width / image.width) * image.height;
    const offsetY = (canvas.height - trueHeight) / 2;
    imageCoords.y = ((canvas.y - offsetY) / trueHeight) * image.height;
  }

  return imageCoords;
};

export const coordsInBox = (coords: Point, box: Box) => {
  return (
    coords.x > box.x &&
    coords.x < box.x + box.width &&
    coords.y > box.y &&
    coords.y < box.y + box.height
  );
};

export const capitalizeString = (s: string) => {
  return s
    .split(" ")
    .map((s) => s[0].toLocaleUpperCase() + s.substr(1))
    .join(" ");
};
