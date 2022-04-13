import { File } from "web3.storage";
import { storeFiles } from "./ipfs";
import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import fs from "fs";
import Store from "electron-store";
import { getAssetPath } from "./main";
import path from "path";


import { NFTStorage, File } from "nft.storage";
import mime from "mime";


const NFT_STORAGE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEU1NWMzYjk2QzJFQTI4M0E0Njg3RmNhZmVFNUUxRDhBZDc0N2NiMjIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0OTQyMDkwNjIyMiwibmFtZSI6IlByZW5leiBQbGFjZSAwMCJ9.OCrmETFhPLfI2HDeuOrIvLNdy6X7v5K2nTxwNFoKZaI";


const store = new Store();

enum TxType {
  NewDebate = "NewDebate",
}


async function fileFromPath(filePath) {
  const content = await fs.promises.readFile(filePath);
  const type = mime.getType(filePath);
  return new File([content], path.basename(filePath), { type });
}


// Use namespace to create a Singleton
export namespace EthTxProcessor {
  let isProcessing: boolean = false;

  const shiftTxQueue = () => {
    const txQueue = store.get("ethTxQueue") || [];
    if (txQueue.length > 0) {
      store.set("ethTxQueue", txQueue.slice(1));
    }
  };

  export const processTxQueue = async () => {
    const isConnected = true; // TODO
    if (isProcessing || !isConnected) {
      return;
    }
    // toggle the semaphore
    isProcessing = true;

    while (true) {
      const txQueue = store.get("ethTxQueue") || [];
      if (txQueue.length === 0 || !isConnected) {
        // toggle the semaphore
        isProcessing = false;
        break;
      }
      const tx = txQueue[0];
      // process the tx
      switch (tx.type) {
        case TxType.NewDebate:
          let debate = store.get(`debates.${tx.id}`);


          /////


          // load the file from disk
          const image = await fileFromPath(getAssetPath("tmp-nft-image.jpeg"));
          const animation = await fileFromPath(debate.recording);

          // create a new NFTStorage client using our API key
          const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

          // call client.store, passing in the image & metadata
          const formattedDate = new Date(debate.time).toISOString().split("T")[0];
          const { ipnft, url } = await nftstorage.store({
            name: `${debate.location} • ${formattedDate} • Prenez Place !`,
            description: `${debate.location} • ${formattedDate} • Prenez Place !`,
            image,
            animation,
            attributes:
              [
                {
                  trait_type: "Location",
                  value: debate.location
                },
                {
                  trait_type: "Date",
                  value: Math.floor(debate.time / 1000),
                  display_type: "date"
                }
              ]
          });
          // TODO mint the NFT

          break;
        default:
          console.log("Unknown tx type:", tx.type);
          isProcessing = false;
          return;
      }
      // remove tx from the queue
      shiftTxQueue();
    }
  };
}

const addTxToQueue = (tx: { type: TxType, id: string }) => {
  const txQueue = store.get("ethTxQueue") || [];
  txQueue.push(tx);
  store.set(`ethTxQueue`, txQueue);
};


export const handleNewDebate = async (_event: IpcMainInvokeEvent, id: string) => {
  addTxToQueue({ type: TxType.NewDebate, id });
  await EthTxProcessor.processTxQueue();
};

