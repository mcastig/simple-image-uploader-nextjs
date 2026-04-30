import styles from "./Header.module.css";

interface HeaderProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.nav}>
        <div className={styles.logo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-small.svg" alt="" width={22} height={26} />
          <span className={styles.logoText}>ImageUpload</span>
        </div>
        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/Moon_fill.svg" alt="Switch to dark mode" width={20} height={20} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/Sun_fill.svg" alt="Switch to light mode" width={20} height={20} />
          )}
        </button>
      </div>
    </header>
  );
}
