import fs from "fs";
import path from "path";
import { app } from "electron";
import { fragmentRecorderTimeslice } from "../renderer/audioRecorders";

const concat = require("concat-files");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path.replace("app.asar", "app.asar.unpacked");

ffmpeg.setFfmpegPath(ffmpegPath);

// TODO make this parameterizable
const fragmentMaxDuration = 20 * 1000;

const debatesDir = path.join(app.getPath("userData"), "debates");
const fragmentsDir = path.join(app.getPath("userData"), "fragments");
const concatPartsFilename = "parts";
const outputFilename = "output.mp3";

export const handleDebateRecordInit = (id: string) => {
  // create a new directory for the debate parts
  fs.mkdirSync(path.join(debatesDir, id), { recursive: true });
};

export const handleDebateRecordNewPart = async ([recorderId, buffer, isLast]) => {
  const cwd = path.join(debatesDir, recorderId);
  // write new part to disk
  const filename = new Date().getTime().toString();
  // write buffer to file
  fs.writeFileSync(path.join(cwd, filename), buffer);
  // if last part, encode all parts into a single file
  if (isLast) {
    const parts = fs.readdirSync(cwd).map(f => path.join(cwd, f));
    const concatPartsFilePath = path.join(cwd, concatPartsFilename);
    const outputFilePath = path.join(cwd, outputFilename);
    concat(parts, concatPartsFilePath, (err) => {
      if (err) {
        console.log(err);
      }
      // https://trac.ffmpeg.org/wiki/Encode/MP3
      ffmpeg(concatPartsFilePath)
        .audioQuality(4)
        .save(outputFilePath);
      // todo use .on('end' to move final file and clean
      // TODO also clean the last fragment recorder parts
    });
  }
};

export const handleFragmentRecordInit = (id: string) => {
  // create a new directory for the next fragment parts
  fs.mkdirSync(path.join(fragmentsDir, id), { recursive: true });
};

export const handleFragmentRecordNewPart = async ([recorderId, buffer, isLast, currentKeyword]) => {
  const cwd = path.join(fragmentsDir, recorderId);
  // write new part to disk
  const filename = new Date().getTime().toString();
  // write buffer to file
  fs.writeFileSync(path.join(cwd, filename), buffer);
  // if last part, encode all parts into a single file and slice it
  if (isLast) {
    // count the number of files in the directory
    const files = fs.readdirSync(cwd);
    const nbFiles = files.length;
    // estimate the final duration of the encoded file
    const estimatedDuration = (nbFiles-1) * fragmentRecorderTimeslice;
    const startTime = Math.max(0, estimatedDuration - fragmentMaxDuration) / 1000;
    // concat all parts into a single file
    const parts = files.map(f => path.join(cwd, f));
    const concatPartsFilePath = path.join(cwd, concatPartsFilename);
    const outputFilePath = path.join(cwd, outputFilename);
    concat(parts, concatPartsFilePath, (err) => {
      if (err) {
        console.log(err);
      }
      // encode the file and slice it to only keep a fragment
      ffmpeg(concatPartsFilePath)
        .seekInput(startTime)
        // https://trac.ffmpeg.org/wiki/Encode/MP3
        .audioQuality(4)
        .save(outputFilePath);
      // todo use .on('end' to move final file and clean
    });
  }

};
