import styles from './Keywords.module.scss';

const KeywordCard = ({ title }: { title: string }) => {
  return (
    <div className={styles.keywordCard}>
      <h3>{title}</h3>
      <span>link to fragments</span>
      <span>remove</span>
    </div>
  );
};

const KeywordCreationCard = () => {
  return (
    <div className={styles.fragmentCard}>
      <h3>Add ➕</h3>
    </div>
  );
};

const keywords = ['short', 'long long long'];

const Keywords = () => {
  return (
    <div className={styles.vWrapper}>
      {keywords.map((kw) => {
        return <KeywordCard title={kw} key={kw} />;
      })}
      <KeywordCreationCard />
    </div>
  );
};

export default Keywords;
