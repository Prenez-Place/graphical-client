import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import fs from "fs";
import Store from "electron-store";
import { getAssetPath } from "./main";
import path from "path";
const Web3 = require('web3');
import { NFTStorage, File } from "nft.storage";
import mime from "mime";

const store = new Store();

const NFT_STORAGE_KEY = store.get('settings.ipfsApiToken') || "";
const ETH_PRIVATE_KEY = store.get('settings.ethPrivateKey') || "";
const DEBATES_ERC721_ADDRESS = store.get('settings.debatesNftAddress') || "";

const ERC721_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_tokenUri",
        "type": "string"
      }
    ],
    "name": "mintTo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

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
          // load files
          const image = await fileFromPath(getAssetPath("tmp-nft-image.jpeg"));
          const animation = await fileFromPath(debate.recording);
          // create a new NFTStorage with the API key
          const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });
          // push data to IPFS
          const formattedDate = new Date(debate.time).toISOString().split("T")[0];
          const { ipnft, url } = await nftstorage.store({
            name: `Prenez Place ! • ${debate.location} • ${formattedDate}`,
            description: `Prenez Place ! • ${debate.location} • ${formattedDate}`,
            image,
            animation_url: animation,
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
          const tokenUri = `ipfs://${ipnft}/metadata.json`
          // Mint the NFT
          const web3 = new Web3("https://polygon-rpc.com")
          const debatesContract = new web3.eth.Contract(ERC721_ABI, DEBATES_ERC721_ADDRESS);
          web3.eth.accounts.wallet.add(ETH_PRIVATE_KEY);
          const senderAddress = web3.eth.accounts.wallet[0].address;
          // send transaction using the private key
          const unsignedTx = debatesContract.methods.mintTo(senderAddress, tokenUri);
          const gas = await unsignedTx.estimateGas({from: senderAddress});
          const gasPrice = await web3.eth.getGasPrice();
          await unsignedTx.send({
            from: senderAddress,
            gas,
            gasPrice,
          });
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

