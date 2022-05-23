import * as tf from "@tensorflow/tfjs";
import { GraphModel, Tensor } from "@tensorflow/tfjs";
import { wasteClasses } from "./constants";
import { Box, DetectionResult } from "./types";

let model: GraphModel | null = null;

const init = async (modelUrl: string) => {
  if (!model) {
    model = await tf.loadGraphModel(modelUrl);
  }
};

const detect = async (
  input: HTMLVideoElement,
  options = { numResults: 20, threshold: 0.5 }
): Promise<DetectionResult[]> => {
  if (!model) {
    return [];
  }

  let temp = tf.browser.fromPixels(input);

  const batched = tf.expandDims(temp);
  temp.dispose();

  const imageHeight = batched.shape[1];
  const imageWidth = batched.shape[2];

  if (!(imageWidth && imageHeight)) {
    console.error("detect - imageWidth or imageHeight is undefined");
    return [];
  }

  /*
    executeAsync will return an array of 8 Tensors, which are the following.
    An asterick indicates that the tensor is useful to us, and will be processed
    
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
  batched.dispose();

  // 1D array with 4 * N elements. bounds are ordered as ymin, xmin, ymax, xmax
  const boxes = await modelOutput[0].data();
  const classes = await modelOutput[1].data();
  const scores = await modelOutput[2].data();
  let numDetections = (await modelOutput[3].data())[0];
  tf.dispose(modelOutput);

  const detectionResults: DetectionResult[] = [];

  if (options.numResults < numDetections) {
    numDetections = options.numResults;
  }

  for (let i = 0; i < numDetections; i++) {
    if (scores[i] < options.threshold) {
      // Results from this point forward will be below threshold, processing complete
      break;
    }

    const [ymin, xmin, ymax, xmax] = boxes.slice(i * 4, (i + 1) * 4) as unknown as number[];
    const bndBox: Box = {
      x: xmin * imageWidth,
      y: ymin * imageHeight,
      width: (xmax - xmin) * imageWidth,
      height: (ymax - ymin) * imageHeight,
    };
    const clazz = wasteClasses[Math.round(classes[i] - 1)];
    detectionResults.push({ bndBox, class: clazz, confidence: scores[i] });
  }

  return detectionResults;
};

export interface DetectionOptions {
  numResults: number;
  threshold: number;
}

const tfjsModel = {
  model,
  init,
  detect,
};

export default tfjsModel;

export type TFJSModel = typeof tfjsModel;
