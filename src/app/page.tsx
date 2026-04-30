"use client";

import { useState, useCallback } from "react";
import type { FileRejection } from "react-dropzone";
import styles from "./page.module.css";
import Header from "@/frontend/components/Header/Header";
import Dropzone from "@/frontend/components/Dropzone/Dropzone";
import UploadLoader from "@/frontend/components/UploadLoader/UploadLoader";
import UploadSuccess from "@/frontend/components/UploadSuccess/UploadSuccess";
import UploadError from "@/frontend/components/UploadError/UploadError";

type UploadState = "idle" | "uploading" | "success" | "error";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [state, setState] = useState<UploadState>("idle");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [error, setError] = useState("");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const doUpload = useCallback(async (file: File) => {
    setState("uploading");
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        setState("error");
        return;
      }
      setUploadedUrl(data.url);
      setUploadedFilename(data.filename);
      setTimeout(() => setState("success"), 3000);
    } catch {
      setError("Upload failed. Please try again.");
      setState("error");
    }
  }, []);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      if (rejected.length > 0) {
        const code = rejected[0].errors[0]?.code;
        setError(
          code === "file-too-large"
            ? "File is too large. Max size is 2MB."
            : code === "file-invalid-type"
              ? "Invalid type. Only JPG, PNG or GIF allowed."
              : "File rejected. Please try again.",
        );
        setState("error");
        return;
      }
      if (accepted[0]) doUpload(accepted[0]);
    },
    [doUpload],
  );

  const reset = () => {
    setState("idle");
    setUploadedUrl("");
    setUploadedFilename("");
    setError("");
  };

  const cardMod =
    state === "uploading"
      ? styles.cardLoading
      : state === "success"
        ? styles.cardSuccess
        : "";

  return (
    <div className={styles.wrapper}>
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className={styles.main}>
        <div className={`${styles.card} ${cardMod}`.trim()}>
          {state === "idle" && <Dropzone onDrop={onDrop} />}
          {state === "uploading" && <UploadLoader />}
          {state === "success" && (
            <UploadSuccess
              uploadedUrl={uploadedUrl}
              uploadedFilename={uploadedFilename}
              onReset={reset}
            />
          )}
          {state === "error" && <UploadError error={error} onReset={reset} />}
        </div>
      </main>
    </div>
  );
}
