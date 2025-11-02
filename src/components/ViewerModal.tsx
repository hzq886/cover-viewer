"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";

type ViewerModalProps = {
  open: boolean;
  onClose: () => void;
  poster: ReactNode;
  info: ReactNode;
};

function ViewerModal({ open, onClose, poster, info }: ViewerModalProps) {
  const { t } = useI18n();
  const closeLabel = t("viewerModal.close");
  if (!open) return null;

  return (
    <div className="viewer-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="viewer-modal__backdrop"
        onClick={onClose}
        aria-label={closeLabel}
      >
        <span className="sr-only">{closeLabel}</span>
      </button>
      <div className="viewer-modal__content">
        <button
          type="button"
          className="viewer-modal__close"
          onClick={onClose}
          aria-label={closeLabel}
        ></button>
        <div className="viewer-modal__body">
          {poster ? (
            <div className="viewer-modal__panel viewer-modal__poster">
              {poster}
            </div>
          ) : null}
          {info ? (
            <div className="viewer-modal__panel viewer-modal__info">{info}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default ViewerModal;
