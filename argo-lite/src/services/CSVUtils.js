/* eslint-disable import/prefer-default-export */
// reason: util file
import fs from "fs-jetpack";
import parse from "csv-parse/lib/sync";
import { getLinesAsync } from "./IOUtils";

export async function peakCSV(path, hasHeader, delimiter) {
  const topLines = (await getLinesAsync(path, 20))
    .map(it => it.trim())
    .join("\n");
  if (hasHeader) {
    return parse(topLines, {
      comment: "#",
      trim: true,
      auto_parse: true,
      skip_empty_lines: true,
      columns: hasHeader,
      delimiter
    });
  }
  return parse(topLines, {
    comment: "#",
    trim: true,
    auto_parse: true,
    skip_empty_lines: true,
    columns: undefined,
    delimiter
  });
}

export async function readCSV(path, hasHeader, delimiter) {
  // TODO: this reads the entire file into memory for now
  const content = await fs.readAsync(path);
  if (hasHeader) {
    return parse(content, {
      comment: "#",
      trim: true,
      auto_parse: true,
      skip_empty_lines: true,
      columns: hasHeader,
      delimiter
    });
  }
  return parse(content, {
    comment: "#",
    trim: true,
    auto_parse: true,
    skip_empty_lines: true,
    columns: undefined,
    delimiter
  });
}
