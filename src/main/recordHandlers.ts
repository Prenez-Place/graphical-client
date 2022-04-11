import fs from "fs";
import path from "path";
import { app } from "electron";

const concat = require('concat-files');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path.replace('app.asar', 'app.asar.unpacked');

ffmpeg.setFfmpegPath(ffmpegPath);

// TODO use a unique debate id instead, sent from the renderer
const debatePartsDir = path.join(app.getPath("userData"), "debate-parts");
const partsFilePath = path.join(debatePartsDir, 'parts');
const outputFilePath = path.join(debatePartsDir, 'output.mp3');

export const handleDebateRecordNewPart = async ([buffer, isLast]) => {
  // create directory if it doesn't exist
  if (!fs.existsSync(debatePartsDir)) {
    fs.mkdirSync(debatePartsDir);
  }
  // write new part to disk
  const filename = new Date().getTime().toString();
  // write buffer to file
  fs.writeFileSync(path.join(debatePartsDir, filename), buffer);

  // if last part, encode all parts into a single file
  if (isLast) {
    const parts = fs.readdirSync(debatePartsDir).map(f => path.join(debatePartsDir, f));
    concat(parts, partsFilePath, (err) => {
      if (err) {
        console.log(err);
      }
      // https://trac.ffmpeg.org/wiki/Encode/MP3
      ffmpeg(partsFilePath)
        .audioQuality(4)
        .save(outputFilePath);
    });

  }
};
