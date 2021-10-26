import "@tensorflow/tfjs-backend-webgl";
import { GraphModel, loadGraphModel } from "@tensorflow/tfjs-converter";
import { browser, dispose, expandDims, Tensor, tidy } from "@tensorflow/tfjs-core";
import { wasteClasses } from "./constants";
import { Box, DetectionResult } from "./types";

let model: GraphModel;

const init = async (modelUrl: string) => {
  if (!model) {
    model = await loadGraphModel(modelUrl);
  }
};

const detect = async (
  input: any,
  options = { numResults: 20, threshold: 0.5 }
): Promise<DetectionResult[]> => {
  if (!model) {
    return [];
  }

  const batched = tidy(() => {
    if (!(input instanceof Tensor)) {
      input = browser.fromPixels(input);
    }
    // Reshape to a single-element batch so we can pass it to executeAsync.
    return expandDims(input);
  });

  const imageHeight = batched.shape[1];
  const imageWidth = batched.shape[2];

  if (!(imageWidth && imageHeight)) {
    console.error("detect - imageWidth or imageHeight is undefined");
    return [];
  }

  /*
        executeAsync will return an array of 8 Tensors, which are the following.
        An asterick indicates that the info is useful to us
        
        output_node_name    name                          shape
        Identity:0          detection_anchor_indices      [1, 100]
        Identity_1:0*       detection_boxes               [1 100 4]
        Identity_2:0*       detection_classes             [1 100]
        Identity_3:0        detection_multiclass_scores   [1 100 5]
        Identity_4:0*       detection_scores              [1 100]
        Identity_5:0*       num_detections                [1]
        Identity_6:0        raw_detection_boxes           [1 1917 4]
        Identity_7:0        raw_detection_scores          [1 1917 5]
       */

  const modelOutput = (await model.executeAsync(batched, [
    "Identity_1:0",
    "Identity_2:0",
    "Identity_4:0",
    "Identity_5:0",
  ])) as Tensor[];

  // 1D array with 4 * N elements. bounds are ordered as ymin, xmin, ymax, xmax
  const boxes = await modelOutput[0].data();
  const classes = await modelOutput[1].data();
  const scores = await modelOutput[2].data();
  let numDetections = (await modelOutput[3].data())[0];

  const detectionResults: DetectionResult[] = [];

  if (options.numResults < numDetections) {
    numDetections = options.numResults;
  }

  for (let i = 0; i < numDetections; i++) {
    if (scores[i] < options.threshold) {
      // Results from this point forward will be below threshold, processing complete
      break;
    }

    // @ts-ignore
    const [ymin, xmin, ymax, xmax] = boxes.slice(i * 4, (i + 1) * 4);
    const bndBox: Box = {
      x: xmin * imageWidth,
      y: ymin * imageHeight,
      width: (xmax - xmin) * imageWidth,
      height: (ymax - ymin) * imageHeight,
    };
    const clazz = wasteClasses[Math.round(classes[i] - 1)];
    detectionResults.push({ bndBox, class: clazz, confidence: scores[i] });
  }

  // clean the tensors
  batched.dispose();
  dispose(modelOutput);

  return detectionResults;
};

export interface DetectionOptions {
  numResults: number;
  threshold: number;
}

export interface TFJSModel {
  init(modelUrl: string): Promise<void>;
  detect(input: any, options: DetectionOptions): Promise<DetectionResult[]>;
}

export const tfjsModel: TFJSModel = {
  init,
  detect,
};