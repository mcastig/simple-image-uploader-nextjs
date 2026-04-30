import styles from "./UploadError.module.css";

interface UploadErrorProps {
  error: string;
  onReset: () => void;
}

export default function UploadError({ error, onReset }: UploadErrorProps) {
  return (
    <div className={styles.errorState}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/exit.svg" alt="" width={40} height={40} />
      <p className={styles.errMsg}>{error}</p>
      <button className={styles.retryBtn} onClick={onReset}>
        Try again
      </button>
    </div>
  );
}
