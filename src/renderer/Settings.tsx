import styles from './Settings.module.scss';
import { useState } from "react";

const Settings = () => {
  const initialSettings = window.electron.store.get("settings") || { };

  const [rpcPath, setRpcPath] = useState(initialSettings.rpcPath || "");
  const [ethPrivateKey, setEthPrivateKey] = useState(initialSettings.ethPrivateKey || "");
  const [ipfsApiToken, setIpfsApiToken] = useState(initialSettings.ipfsApiToken || "");
  const [debatesNftAddress, setDebatesNftAddress] = useState(initialSettings.debatesNftAddress || "");
  const [fragmentsNftAddress, setFragmentsNftAddress] = useState(initialSettings.fragmentsNftAddress || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    window.electron.store.set("settings", {
      rpcPath,
      ethPrivateKey,
      ipfsApiToken,
      debatesNftAddress,
      fragmentsNftAddress
    });
    // todo notification
  }

  return (
    <div>
      <h1>Paramètres</h1>
      <form onSubmit={handleSubmit}>
        <label>
          rpcPath:
          <input type="text" placeholder={"todo"} value={rpcPath} onChange={e => {
            setRpcPath(e.target.value);
          }} />
        </label>
        <label>
          ⚠⚠ ethPrivateKey (as given by MM) (should be the NFT collections' owner) ⚠⚠:
          <input type="password" value={ethPrivateKey} onChange={e => {
            setEthPrivateKey(e.target.value);
          }} />
        </label>
        <label>
          ipfsApiToken:
          <input type="password" value={ipfsApiToken} onChange={e => {
            setIpfsApiToken(e.target.value);
          }} />
        </label>
        <label>
          debatesNftAddress:
          <input type="text" placeholder={"0xb7413449779e362becAb23319350d6ba39bC8040"} value={debatesNftAddress} onChange={e => {
            setDebatesNftAddress(e.target.value);
          }} />
        </label>
        <label>
          fragmentsNftAddress:
          <input type="text" placeholder={"0xb7413449779e362becAb23319350d6ba39bC8040"} value={fragmentsNftAddress} onChange={e => {
            setFragmentsNftAddress(e.target.value);
          }} />
        </label>
        <input type="submit" value="Submit" disabled={false} />
      </form>
    </div>
  );
};

export default Settings;
