/* eslint-disable import/prefer-default-export */
// reason: util file

import fs from "fs";
import Promise from "bluebird";

export function getLines(filename, lineCount, callback) {
  const stream = fs.createReadStream(filename, {
    flags: "r",
    encoding: "utf-8",
    fd: null,
    mode: 438, // 0666 in Octal
    bufferSize: 64 * 1024
  });

  let data = "";
  let lines = [];
  stream.on("data", moreData => {
    data += moreData;
    lines = data.split("\n");
    // probably that last line is "corrupt" - halfway read - why > not >=
    if (lines.length > lineCount + 1) {
      stream.destroy();
      lines = lines.slice(0, lineCount); // junk as above
      callback(false, lines);
    }
  });

  stream.on("error", () => {
    callback("Error");
  });

  stream.on("end", () => {
    callback(false, lines);
  });
}

export const getLinesAsync = Promise.promisify(getLines);
