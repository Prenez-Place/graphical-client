import styles from "./Keywords.module.scss";
import { useState } from "react";

const KeywordCard = ({ keyword, onRemove }: { keyword: string, onRemove: () => void }) => {
  return (
    <div>
      <h3>{keyword}</h3>
      <span>link to fragments</span>
      <button onClick={onRemove}>remove</button>
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
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={keyword} onChange={e => {
            setKeyword(e.target.value);
          }} />
        </label>
        <input type="submit" value="Submit" disabled={keyword.length < 1} />
      </form>
    </div>
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
