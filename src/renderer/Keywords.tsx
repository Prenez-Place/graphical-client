import styles from "./Keywords.module.scss";
import { useState } from "react";
import { functions } from "electron-log";

const KeywordCard = ({ keyword, onRemove }: { keyword: string }) => {
  return (
    <div className={styles.keywordCard}>
      <h3>{keyword}</h3>
      <span>link to fragments</span>
      <button onClick={onRemove}>remove</button>
      {/* move to dedicated page */}
    </div>
  );
};

const KeywordCreationCard = ({ onAdd }) => {
  return (
    <button className={styles.fragmentCard} onClick={onAdd}>
      <h3>Add ➕</h3>
    </button>
  );
};

const Keywords = () => {
  const initialKeywords = window.electron.store.get("keywords") || [];
  const [keywords, setKeywords] = useState(initialKeywords);

  const addKeyword = (keyword: string) => {
    // TODO do not forget to normalize the new keyword
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
      {keywords.map((kw: string) => {
        return <KeywordCard keyword={kw} key={kw} onRemove={() => {
          removeKeyword(kw);
        }} />;
      })
      }
      <KeywordCreationCard onAdd={() => {
        addKeyword(new Date().getTime().toString());
      }} />
    </div>
  );
};

export default Keywords;
