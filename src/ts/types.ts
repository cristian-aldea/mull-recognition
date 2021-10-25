import { wasteClasses } from "./constants";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Box extends Point, Size {}

export enum WasteCategory {
  TRASH = "Trash",
  RECYCLABLE = "Recyclable",
  COMPOST = "Compost",
  EWASTE = "E-Waste",
}

export type WasteClassesType = typeof wasteClasses[number];

export type WasteClassMapType = {
  [key in WasteClassesType]: { category: WasteCategory; info: string };
};

export interface DetectionResult {
  class: WasteClassesType;
  bndBox: Box;
  confidence: number;
}
