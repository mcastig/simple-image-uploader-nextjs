"use client";

import { useDropzone } from "react-dropzone";
import type { FileRejection } from "react-dropzone";
import styles from "./Dropzone.module.css";

interface DropzoneProps {
  onDrop: (accepted: File[], rejected: FileRejection[]) => void;
}

export default function Dropzone({ onDrop }: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 2 * 1024 * 1024,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`${styles.dropzone}${isDragActive ? ` ${styles.dragActive}` : ""}`}
    >
      <input {...getInputProps()} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/exit.svg"
        alt=""
        width={30}
        height={30}
        className={styles.uploadIcon}
      />
      <p className={styles.dropText}>
        Drag &amp; drop a file or{" "}
        <span className={styles.browse}>browse files</span>
      </p>
      <p className={styles.hint}>JPG, PNG or GIF - Max file size 2MB</p>
    </div>
  );
}
