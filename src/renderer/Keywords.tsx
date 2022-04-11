import styles from './Keywords.module.scss';

const KeywordCard = ({ keyword }: { keyword: string }) => {
  const onRemoveClick = () => {
    const keywords = window.electron.store.get('keywords') || [];
    // remove element from array
    const newKeywords = keywords.filter((k: string) => k !== keyword);
    window.electron.store.set('keywords', newKeywords);
  };

  return (
    <div className={styles.keywordCard}>
      <h3>{keyword}</h3>
      <span>link to fragments</span>
      <button onClick={onRemoveClick}>remove</button>
      {/* move to dedicated page */}
    </div>
  );
};

const KeywordCreationCard = () => {
  const onCreationClick = () => {
    // TODO do not forget to normalize the new keyword
    const newKeyword = new Date().getTime();
    const keywords = window.electron.store.get('keywords') || [];
    if (!keywords.includes(newKeyword)) {
      // append new keyword
      keywords.push(newKeyword);
      window.electron.store.set('keywords', keywords);
    }
  };

  return (
    <button className={styles.fragmentCard} onClick={onCreationClick}>
      <h3>Add ➕</h3>
    </button>
  );
};

const Keywords = () => {
  const keywords = window.electron.store.get('keywords') || []; // TODO use reducer
  return (
    <div className={styles.vWrapper}>
      {keywords.map((kw: string) => {
        return <KeywordCard keyword={kw} key={kw} />;
      })}
      <KeywordCreationCard />
    </div>
  );
};

export default Keywords;
