"use client";

import { useState } from "react";
import styles from "./UploadSuccess.module.css";

interface UploadSuccessProps {
  uploadedUrl: string;
  uploadedFilename: string;
  onReset: () => void;
}

export default function UploadSuccess({
  uploadedUrl,
  uploadedFilename,
  onReset,
}: UploadSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(uploadedUrl);
    } catch {
      const el = document.createElement("textarea");
      el.value = uploadedUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `/api/download/${uploadedFilename}`;
    a.download = uploadedFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className={styles.success}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={uploadedUrl} alt="Uploaded" className={styles.preview} />
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleShare}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Link.svg" alt="" width={12} height={12} />
          {copied ? "Copied!" : "Share"}
        </button>
        <button className={styles.btn} onClick={handleDownload}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/download.svg" alt="" width={12} height={12} />
          Download
        </button>
      </div>
      <button className={styles.uploadAgain} onClick={onReset}>
        Upload another image
      </button>
    </div>
  );
}
