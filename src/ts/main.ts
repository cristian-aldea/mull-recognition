import { MULL_MODEL_URL, wasteClasses } from "./constants";
import "./dom-elements";
import {
  canvas,
  confirmation,
  confirmationButton,
  hiddenCanvas,
  supportedObjects,
  video,
} from "./dom-elements";
import "./events";
import { Box, DetectionResult, Size } from "./types";
import { canvasToImageCoords, coordsInBox, detectFrame, setStatusInfo, showModal } from "./utils";

supportedObjects.textContent = wasteClasses.join(", ");

export interface ResultRef {
  current: DetectionResult[];
}
const results: ResultRef = { current: [] };
let tfjsModel = null;

confirmationButton.addEventListener("click", () => {
  confirmation.style.display = "none";
  video.style.display = "block";
  canvas.style.display = "block";
  setup();
});

/**
 * Set up model, camera, listeners and other resources for the waste recognition page
 */
const setup = async () => {
  canvas.addEventListener("click", onCanvasClick);
  video.addEventListener("loadedmetadata", onVideoReady);

  setStatusInfo("Requesting access to camera");

  try {
    await setupCamera();
  } catch (err) {
    console.error(err);
    setStatusInfo("Cannot access camera. this app requires a camera to work.");
    return;
  }
};

const onVideoReady = async () => {
  setStatusInfo("Loading app...");

  try {
    const tfjsModelImport = await import("./tfjs.model");
    tfjsModel = tfjsModelImport.default;
    await tfjsModel.init(MULL_MODEL_URL);
  } catch (err) {
    console.error(err);
    setStatusInfo("Failed to load app, your device might not be supported :(");
    return;
  }

  setStatusInfo("App loaded successfully! Finishing up...");

  detectFrame(video, tfjsModel, canvas, results);
};

const setupCamera = async () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 99999 }, height: { ideal: 99999 } },
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

const onCanvasClick = (event: MouseEvent) => {
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
