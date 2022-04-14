import styles from "./Keywords.module.scss";
import { useState } from "react";
import addIcon from "../../assets/add.svg";
import removeIcon from "../../assets/minus.svg";

const KeywordCard = ({ keyword, onRemove }: { keyword: string, onRemove: () => void }) => {
  return (
    <div className={styles.kwCard}>
      <p>{keyword}</p>
      <div className={styles.actionIcon}>
        <img src={removeIcon} alt="remove" onClick={onRemove} />
      </div>
    </div>
  );
};

const KeywordCreationCard = ({ onAdd }) => {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.length > 0) {
      onAdd(keyword);
      setKeyword("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className={styles.newKwCard}>
        <input type="text" value={keyword} placeholder={'Nouveau mot clé'} onChange={e => {
          setKeyword(e.target.value);
        }} />
        <div className={styles.actionIcon}>
          <img src={addIcon} alt="add" onClick={handleSubmit}/>
        </div>
      </div>
    </form>
  );
};

const Keywords = () => {
  const initialKeywords = window.electron.store.get("keywords") || [];
  const [keywords, setKeywords] = useState(initialKeywords);

  const addKeyword = (keyword: string) => {
    // normalize the keyword
    keyword = keyword.toLowerCase().trim();
    // add to list if not already present
    if (!keywords.includes(keyword)) {
      const newKeywords = [...keywords, keyword];
      setKeywords(newKeywords);
      window.electron.store.set("keywords", newKeywords);
    }
  };

  const removeKeyword = (keyword: string) => {
    // remove from list
    const newKeywords = keywords.filter((k: string) => k !== keyword);
    setKeywords(newKeywords);
    window.electron.store.set("keywords", newKeywords);
  };

  return (
    <div className={styles.vWrapper}>
      <h1 className={styles.title}>
        Mots clés
      </h1>
      {keywords.map((kw: string) => {
        return <KeywordCard keyword={kw} key={kw} onRemove={() => {
          removeKeyword(kw);
        }} />;
      })
      }
      <KeywordCreationCard onAdd={addKeyword} />
    </div>
  );
};

export default Keywords;
