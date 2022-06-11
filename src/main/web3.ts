import IpcMainInvokeEvent = Electron.IpcMainInvokeEvent;
import fs from "fs";
import Store from "electron-store";
import Handlebars from "handlebars";
import { getAssetPath } from "./main";
import path from "path";
const Web3 = require("web3");
import { NFTStorage, File } from "nft.storage";
import mime from "mime";

const store = new Store();

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
  NewFragment = "NewFragment",
}

async function fileFromPath(filePath) {
  const content = await fs.promises.readFile(filePath);
  const type = mime.getType(filePath);
  return new File([content], path.basename(filePath), { type });
}

const createVisualization = async (templateFilePath: string, params: object) => {
  const type = mime.getType(templateFilePath);
  // create image from template
  const templateContent = await fs.promises.readFile(templateFilePath);
  const source = templateContent.toString();
  const template = Handlebars.compile(source);
  const result = template(params);
  // return new file
  return new File([Buffer.from(result, 'utf8')], "cover.svg", { type });
};

const pushMetadata = async (metadata: any)  => {
  // create a new NFTStorage with the API key
  const nftStorageKey = store.get("settings.ipfsApiToken") || "";
  const nftstorage = new NFTStorage({ token: nftStorageKey });
  const { ipnft } = await nftstorage.store(metadata);
  const tokenUri = `ipfs://${ipnft}/metadata.json`;
  return tokenUri;
};

const mintNft = async (contractAddress: string, tokenUri: string) => {
  const rpcPath = store.get("settings.rpcPath") || "";
  const web3 = new Web3(rpcPath);
  const debatesContract = new web3.eth.Contract(ERC721_ABI, contractAddress);
  const ethPrivateKey = store.get("settings.ethPrivateKey") || "";
  web3.eth.accounts.wallet.add(ethPrivateKey);
  const senderAddress = web3.eth.accounts.wallet[0].address;
  // send transaction using the private key
  const unsignedTx = debatesContract.methods.mintTo(senderAddress, tokenUri);
  const gas = await unsignedTx.estimateGas({ from: senderAddress });
  const gasPrice = await web3.eth.getGasPrice();
  const receipt = await unsignedTx.send({
    from: senderAddress,
    gas,
    gasPrice
  });
  return receipt;
};

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
      let formattedDate, formattedLocalDate, image, animation, metadata, tokenUri;
      console.log(`starting tx processing: ${tx.type}`);
      switch (tx.type) {
        case TxType.NewDebate:
          const debate = store.get(`debates.${tx.id}`);
          // load files
          formattedDate = new Date(debate.time).toISOString().split("T")[0];
          formattedLocalDate = new Date(debate.time).toLocaleDateString('fr');
          image = await createVisualization(
            getAssetPath("nft-debate-template.svg"),
            {date: formattedLocalDate, location: debate.location}
          );
          animation = await fileFromPath(debate.recording);
          // create the metadata file
          metadata = {
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
          }
          try {
            // push data to IPFS
            tokenUri = await pushMetadata(metadata);
            console.log(`tokenUri: ${tokenUri}`);
            // mint the NFT
            const debatesErc721Address = store.get("settings.debatesNftAddress") || "";
            await mintNft(debatesErc721Address, tokenUri);
            console.log(`nft minted`);
          } catch (e) {
            console.log(`failed to process the tx`);
            return;
          }
          break;
        case TxType.NewFragment:
          const fragment = store.get(`fragments.${tx.id}`);
          // create the metadata file
          formattedDate = new Date(fragment.time).toISOString()
          formattedLocalDate = new Date(fragment.time).toLocaleDateString('fr');
          image = await createVisualization(
            getAssetPath("nft-fragment-template.svg"),
            {date: formattedLocalDate, location: fragment.location, keyword: fragment.keyword}
          );
          animation = await fileFromPath(fragment.recording);
          metadata = {
            name: `Prenez Place ! • ${fragment.keyword} • ${fragment.location} • ${formattedDate}`,
            description: `Prenez Place ! • ${fragment.keyword} • ${fragment.location} • ${formattedDate}`,
            image,
            animation_url: animation,
            attributes:
              [
                {
                  trait_type: "Location",
                  value: fragment.location
                },
                {
                  trait_type: "Keyword",
                  value: fragment.keyword
                },
                {
                  trait_type: "Date",
                  value: Math.floor(fragment.time / 1000),
                  display_type: "date"
                }
              ]
          }
          try {
            // push data to IPFS
            tokenUri = await pushMetadata(metadata);
            console.log(`tokenUri: ${tokenUri}`);
            // mint the NFT
            const fragmentsErc721Address = store.get("settings.fragmentsNftAddress") || "";
            await mintNft(fragmentsErc721Address, tokenUri);
            console.log(`nft minted`);
          } catch (e) {
            console.log(`failed to process the tx`);
            return;
          }
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

export const handleNewFragment = async (_event: IpcMainInvokeEvent, id: string) => {
  addTxToQueue({ type: TxType.NewFragment, id });
  await EthTxProcessor.processTxQueue();
};

