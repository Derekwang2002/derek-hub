import type { ReactNode } from "react";
import styles from "./website-preview.module.css";

const SAFE_IFRAME_SANDBOX = "allow-forms allow-popups allow-scripts";

type WebsitePreviewProps = {
  title: string;
  src?: string;
  image?: string;
  alt?: string;
  children?: ReactNode;
  urlLabel?: string;
  className?: string;
};

export function WebsitePreview({
  title,
  src,
  image,
  alt = "",
  children,
  urlLabel,
  className
}: WebsitePreviewProps) {
  const sourceCount = Number(Boolean(src)) + Number(Boolean(image)) + Number(Boolean(children));

  if (sourceCount !== 1) {
    throw new Error("WebsitePreview requires exactly one of src, image, or children.");
  }

  return (
    <div className={[styles.browser, className].filter(Boolean).join(" ")}>
      <div className={styles.toolbar}>
        <span aria-hidden="true" className={styles.controls}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.address}>{urlLabel ?? title}</span>
        <span aria-hidden="true" className={styles.toolbarSpacer} />
      </div>
      <div className={styles.viewport}>
        {src ? (
          <iframe
            className={styles.frame}
            loading="lazy"
            sandbox={SAFE_IFRAME_SANDBOX}
            src={src}
            title={title}
          />
        ) : null}
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={alt} className={styles.image} decoding="async" loading="lazy" src={image} />
        ) : null}
        {children ? <div className={styles.slice}>{children}</div> : null}
      </div>
    </div>
  );
}
