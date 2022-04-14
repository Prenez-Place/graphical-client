import styles from './Settings.module.scss';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const initialSettings = window.electron.store.get("settings") || { };

  const navigate = useNavigate();
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
    navigate("/");
  }

  return (
    <div className={styles.vWrapper}>
      <h1>Paramètres</h1>
      <form onSubmit={handleSubmit}>
        <label>
          rpcPath
          <input type="text" placeholder={"todo"} value={rpcPath} onChange={e => {
            setRpcPath(e.target.value);
          }} />
        </label>
        <label>
          {/* (as given by MM) (should be the NFT collections' owner) */}
          ⚠ ethPrivateKey ⚠
          <input type="password" value={ethPrivateKey} onChange={e => {
            setEthPrivateKey(e.target.value);
          }} />
        </label>
        <label>
          ipfsApiToken
          <input type="password" value={ipfsApiToken} onChange={e => {
            setIpfsApiToken(e.target.value);
          }} />
        </label>
        <label>
          debatesNftAddress
          <input type="text" placeholder={"0xb7413449779e362becAb23319350d6ba39bC8040"} value={debatesNftAddress} onChange={e => {
            setDebatesNftAddress(e.target.value);
          }} />
        </label>
        <label>
          fragmentsNftAddress
          <input type="text" placeholder={"0xb7413449779e362becAb23319350d6ba39bC8040"} value={fragmentsNftAddress} onChange={e => {
            setFragmentsNftAddress(e.target.value);
          }} />
        </label>
        <input type="submit" value="Sauvegarder" disabled={false} className={styles.submitButton}/>
      </form>
    </div>
  );
};

export default Settings;
