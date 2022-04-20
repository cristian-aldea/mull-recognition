import compostIconUrl from "../../assets/svg/compost-icon.svg";
import ewasteIconUrl from "../../assets/svg/e-waste-icon.svg";
import recyclableIconUrl from "../../assets/svg/recycle-icon.svg";
import trashIconUrl from "../../assets/svg/trash-icon.svg";
import { WasteCategory, WasteClassMapType } from "./types";

export const MULL_MODEL_URL =
  "https://raw.githubusercontent.com/cristian-aldea/mull-model/main/tfjs-2/model.json";

/**
 * This array constant must be updated according to the content of
 * ml/trash-recognition/annotations/label_map.pbtxt
 */
export const wasteClasses = [
  "bottle",
  "box",
  "computer keyboard",
  "food",
  "mobile phone",
  "plastic bag",
  "tin can",
] as const;

export const wasteClassMap: WasteClassMapType = {
  bottle: {
    category: WasteCategory.RECYCLABLE,
    info: "Whether made in plastic or glass, they are recyclable. Just make sure they're clean!",
  },
  box: {
    category: WasteCategory.RECYCLABLE,
    info: "Boxes are typically made of cardboard, and are recyclable. Just make sure they're clean!",
  },
  "computer keyboard": {
    category: WasteCategory.EWASTE,
    info: "Electronic devices like keyboards should be disposed of at specialized e-centers.",
  },
  food: { category: WasteCategory.COMPOST, info: "Food goes in the compost!" },
  "mobile phone": {
    category: WasteCategory.EWASTE,
    info: "Electronic devices like phones should be disposed of at specialized e-centers.",
  },
  "plastic bag": {
    category: WasteCategory.TRASH,
    info: "Plastic bags can be reused. Otherwise, they must be thrown in the garbage.",
  },
  "tin can": { category: WasteCategory.RECYCLABLE, info: "Metal cans can be recycled!" },
};

export const WasteIconMap: { [a in WasteCategory]: { image: HTMLImageElement; url: string } } = {
  [WasteCategory.COMPOST]: { image: new Image(), url: compostIconUrl },
  [WasteCategory.EWASTE]: { image: new Image(), url: ewasteIconUrl },
  [WasteCategory.TRASH]: { image: new Image(), url: trashIconUrl },
  [WasteCategory.RECYCLABLE]: { image: new Image(), url: recyclableIconUrl },
};

for (const entry of Object.values(WasteIconMap)) {
  entry.image.src = entry.url;
}
