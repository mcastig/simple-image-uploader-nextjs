import styles from "./UploadLoader.module.css";

export default function UploadLoader() {
  return (
    <div className={styles.uploading}>
      <p className={styles.uploadLabel}>
        <strong>Uploading</strong>, please wait..
      </p>
      <div className={styles.track}>
        <div className={styles.bar} />
      </div>
    </div>
  );
}
