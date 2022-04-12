import fs from "fs";
import path from "path";
import { app } from "electron";
import { fragmentRecorderTimeslice } from "../renderer/audioRecorders";
import { hashFile } from "./hash";

const concat = require("concat-files");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path.replace("app.asar", "app.asar.unpacked");

ffmpeg.setFfmpegPath(ffmpegPath);

// TODO make this parameterizable
const fragmentMaxDuration = 20 * 1000;

const debatesTmpDir = path.join(app.getPath("userData"), "tmp-debates");
const fragmentsTmpDir = path.join(app.getPath("userData"), "tmp-fragments");
const concatPartsFilename = "parts";
const outputFilename = "output.mp3";

export const debatesDir = path.join(app.getPath("userData"), "debates");
export const fragmentsDir = path.join(app.getPath("userData"), "fragments");

export const handleDebateRecordInit = (id: string) => {
  // create a new directory for the debate parts
  fs.mkdirSync(path.join(debatesTmpDir, id), { recursive: true });
  // create debates directory if it doesn't exist
  if (!fs.existsSync(debatesDir)) {
    fs.mkdirSync(debatesDir, { recursive: true });
  }
};

export const handleDebateRecordNewPart = async (_event, [recorderId, buffer, isLast]) => {
  const cwd = path.join(debatesTmpDir, recorderId);
  // write new part to disk
  const filename = new Date().getTime().toString();
  // write buffer to file
  fs.writeFileSync(path.join(cwd, filename), buffer);
  // if last part, encode all parts into a single file
  if (isLast) {
    const parts = fs.readdirSync(cwd).map(f => path.join(cwd, f));
    const concatPartsFilePath = path.join(cwd, concatPartsFilename);
    const encodedFilePath = path.join(cwd, outputFilename);
    const permFilePath = path.join(debatesDir, `${recorderId}.mp3`);
    // concat parts asynchronously
    await new Promise((resolve) => {
      concat(parts, concatPartsFilePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          resolve();
        }
      });
    });
    // encode concatenated parts into a single file asynchronously
    // https://trac.ffmpeg.org/wiki/Encode/MP3
    await new Promise((resolve) => {
      ffmpeg(concatPartsFilePath)
        .audioQuality(4)
        .output(encodedFilePath)
        .on("end", () => {
          // move file
          fs.renameSync(encodedFilePath, permFilePath);
          // clear temp parts directory
          fs.rmSync(cwd, { recursive: true });
          resolve();
        })
        .run();
    });
    // get SHA256 of the file using sha.js
    const hash = await hashFile(permFilePath);
    return [permFilePath, hash];
  }
};

export const handleFragmentRecordInit = (id: string) => {
  // create a new directory for the next fragment parts
  fs.mkdirSync(path.join(fragmentsTmpDir, id), { recursive: true });
  // create fragments directory if it doesn't exist
  if (!fs.existsSync(fragmentsDir)) {
    fs.mkdirSync(fragmentsDir, { recursive: true });
  }
};

export const handleFragmentRecordDrop = (recorderId: string) => {
  // clear temp parts directory
  const cwd = path.join(fragmentsTmpDir, recorderId);
  fs.rmSync(cwd, { recursive: true });
};

export const handleFragmentRecordNewPart = async (_event, [recorderId, buffer, isLast, currentKeyword]) => {
  const cwd = path.join(fragmentsTmpDir, recorderId);
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
    const encodedFilePath = path.join(cwd, outputFilename);
    const permFilePath = path.join(fragmentsDir, `${recorderId}.mp3`);
    // concat parts asynchronously
    await new Promise((resolve) => {
      concat(parts, concatPartsFilePath, (err) => {
        if (err) {
          console.log(err);
        } else {
          resolve();
        }
      });
    });
    // encode concatenated parts into a single file asynchronously
    // https://trac.ffmpeg.org/wiki/Encode/MP3
    await new Promise((resolve) => {
      ffmpeg(concatPartsFilePath)
        .seekInput(startTime)
        .audioQuality(4)
        .output(encodedFilePath)
        .on("end", () => {
          // move file
          fs.renameSync(encodedFilePath, permFilePath);
          // clear temp parts directory
          fs.rmSync(cwd, { recursive: true });
          resolve();
        })
        .run();
    });
    return permFilePath
  }
};
