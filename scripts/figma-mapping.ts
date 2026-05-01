/**
 * storyId ↔ {fileKey, nodeId} mapping. Updated by figma-publish-frame.ts when a
 * new frame is created or an existing frame is replaced. Imported by
 * figma-export-baselines.ts when the baseline source is Figma rather than Stitch.
 *
 * Edit this file by running scripts; do not hand-edit the MAPPING constant.
 */

export interface FigmaMappingEntry {
  storyId: string;
  fileKey: string;
  nodeId: string;
  publishedAt: string;
}

export const MAPPING: Readonly<Record<string, FigmaMappingEntry>> = {
  // Auto-populated by figma-publish-frame.ts. Example shape:
  // "character-sheet--default": {
  //   storyId: "character-sheet--default",
  //   fileKey: "abc123",
  //   nodeId: "12:34",
  //   publishedAt: "2026-05-01T..."
  // }
};

export function lookup(storyId: string): FigmaMappingEntry | undefined {
  return MAPPING[storyId];
}
