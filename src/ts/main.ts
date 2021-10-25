import { MULL_MODEL_URL, wasteClasses } from "./constants";
import "./modal";
import { tfjsModel } from "./tfjs.model";
import { Box, DetectionResult, Size } from "./types";
import { canvasToImageCoords, coordsInBox, detectFrame, setStatusInfo, showModal } from "./utils";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const hiddenCanvas = document.getElementById("hidden-canvas") as HTMLCanvasElement;
const video = document.getElementById("video") as HTMLVideoElement;
const supportedObjects = document.getElementById("supported-objects") as HTMLDivElement;
supportedObjects.textContent = wasteClasses.join(", ");

export interface ResultRef {
  current: DetectionResult[];
}
let results: ResultRef = { current: [] };

/**
 * Set up model, camera, listeners and other resources for the waste recognition page
 */
const setup = async () => {
  if (canvas) {
    canvas.addEventListener("click", onCanvasClick);
  }

  if (video) {
    video.addEventListener("loadedmetadata", onVideoReady);
  }

  setStatusInfo("Requesting Access to camera");

  try {
    await setupCamera();
  } catch (err) {
    console.error(err);
    setStatusInfo("Error: Cannot access camera");
    return;
  }
};

const onVideoReady = async () => {
  setStatusInfo("Warming up the ML model");

  try {
    await tfjsModel.init(MULL_MODEL_URL);
  } catch (err) {
    console.error(err);
    setStatusInfo("Error loading ML model");
    return;
  }

  setStatusInfo("Model Loaded Successfully! Finishing setup...");

  detectFrame(video, tfjsModel, canvas, results);
};

const setupCamera = async () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    let stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    video.srcObject = stream;
    video.play();

    video.onloadedmetadata = () => {
      // Doesn't work on all browsers. Keeping it here just in case
      // const { width, height } = stream.getTracks()[0].getSettings();
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
  } else {
    throw "Either no camera exists on your device, or your browser denied access to it";
  }
};

export const onCanvasClick = (event: MouseEvent) => {
  const canvas = event.target as HTMLCanvasElement;
  const canvasBox: Box = {
    x: event.offsetX,
    y: event.offsetY,
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  };

  const imageSize: Size = {
    width: canvas.width,
    height: canvas.height,
  };
  const imageCoords = canvasToImageCoords(canvasBox, imageSize);

  const clickedObjects = results.current.filter((result) =>
    coordsInBox(imageCoords, result.bndBox)
  );

  if (clickedObjects.length > 0) {
    // Since results are ordered by confidence, we should take the first result to be the one the user wanted to click
    const clickedObject = clickedObjects[0];

    const imageURL = getImageURL(clickedObject);

    showModal(clickedObject, imageURL);
  }
};

const getImageURL = (detectionResult: DetectionResult): string => {
  const box = detectionResult.bndBox;
  const ctx = hiddenCanvas.getContext("2d");
  if (!ctx) {
    console.error("getImageURL - Error getting ctx");
    return "";
  }

  hiddenCanvas.width = video.videoWidth;
  hiddenCanvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);

  const imageData = ctx.getImageData(box.x, box.y, box.width, box.height);

  hiddenCanvas.width = imageData.width;
  hiddenCanvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  return hiddenCanvas.toDataURL();
};

setup();
