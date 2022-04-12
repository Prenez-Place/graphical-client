import path from 'path';
import { debatesDir, fragmentsDir } from "./recordHandlers";

const atomProtocolHandler = (req, cb) => {
  // remove the 'atom://' prefix
  const requestedPath = req.url.substr(7);
  // check if it is secure
  if (requestedPath.startsWith(debatesDir) || requestedPath.startsWith(fragmentsDir)) {
    // check if the requested file exists
    if (require('fs').existsSync(requestedPath)) {
      cb({
        path: requestedPath,
      });
      return
    }
  }
  cb({
    // -6 is FILE_NOT_FOUND
    // https://source.chromium.org/chromium/chromium/src/+/master:net/base/net_error_list.h
    error: -6,
  });
};

export default atomProtocolHandler;
