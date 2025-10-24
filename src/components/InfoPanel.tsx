"use client";
import type { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/auth/AuthProvider";
import {
  MaterialSymbolsLightFavorite,
  MaterialSymbolsLightFavoriteOutline,
} from "@/components/icons/FavoriteIcon";
import { useI18n } from "@/i18n/I18nProvider";
import { getFirestoreDb, hasFirebaseConfig } from "@/lib/firebase";
import { getMetadata, getStorageRef, uploadBytes } from "@/lib/storage";

type Props = {
  contentId?: string;
  title?: string;
  affiliate?: string;
  actressNames?: string;
  makerName?: string;
  releaseDate?: string;
  posterProxyUrl?: string;
  affiliateUrl?: string;
  commentAreaHeight?: number;
  className?: string;
};

type Comment = {
  id: string;
  text: string;
  createdAt?: Date | null;
};

const DEFAULT_COMMENTS: Comment[] = [];

async function convertBlobToWebp(sourceBlob: Blob): Promise<Blob> {
  if (sourceBlob.type === "image/webp") {
    return sourceBlob;
  }

  const quality = 0.5;

  const renderToCanvas = async (
    image: ImageBitmap | HTMLImageElement,
  ): Promise<Blob> => {
    if (typeof document === "undefined") {
      throw new Error("Cannot convert image to WebP without DOM access");
    }

    const width = image.width;
    const height = image.height;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Failed to acquire canvas context for WebP conversion");
    }
    ctx.drawImage(image, 0, 0, width, height);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result);
          } else {
            reject(new Error("Canvas failed to produce WebP blob"));
          }
        },
        "image/webp",
        quality,
      );
    });
  };

  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(sourceBlob);
    try {
      const webp = await renderToCanvas(bitmap);
      bitmap.close();
      return webp;
    } catch (error) {
      bitmap.close();
      throw error;
    }
  }

  if (typeof document === "undefined") {
    throw new Error("Cannot convert image to WebP without DOM access");
  }

  const objectUrl = URL.createObjectURL(sourceBlob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("Failed to load image for WebP conversion"));
      img.src = objectUrl;
    });
    const webp = await renderToCanvas(image);
    return webp;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

const InfoPanel = React.forwardRef<HTMLDivElement, Props>(function InfoPanel(
  {
    contentId,
    title,
    affiliate,
    actressNames,
    makerName,
    releaseDate,
    posterProxyUrl,
    affiliateUrl,
    commentAreaHeight,
    className,
  },
  ref,
) {
  const { dictionary } = useI18n();
  const infoText = dictionary.infoPanel;
  const commentText = dictionary.comment;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const firebaseReady = useMemo(() => hasFirebaseConfig(), []);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const [comments, setComments] = useState<Comment[]>(DEFAULT_COMMENTS);
  const [pending, setPending] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const timeFormatter = useMemo(
    () =>
      typeof Intl !== "undefined"
        ? new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : null,
    [],
  );

  const cardStyle = useMemo<CSSProperties | undefined>(() => {
    if (!commentAreaHeight) return undefined;
    return { minHeight: `${commentAreaHeight}px` };
  }, [commentAreaHeight]);
  const containerClass = ["info-panel", className].filter(Boolean).join(" ");

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset local state whenever the active content changes
  useEffect(() => {
    setLiked(false);
    setComments(DEFAULT_COMMENTS);
    setLikeCount(0);
    setPending("");
    setPopKey(0);
  }, [contentId]);

  useEffect(() => {
    if (!firebaseReady || !contentId) {
      return;
    }

    const db = getFirestoreDb();
    const baseDocRef = doc(db, "avs", contentId);
    const commentsQuery = query(
      collection(baseDocRef, "comments"),
      orderBy("createdAt", "asc"),
    );

    const unsubDoc = onSnapshot(
      baseDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setLikeCount(0);
          return;
        }
        const data = snapshot.data();
        const value =
          data && typeof data.likeCount === "number" ? data.likeCount : 0;
        setLikeCount(value);
      },
      (error) => {
        console.error("Failed to load like count", error);
      },
    );

    const unsubComments = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const next = snapshot.docs.map((docSnap) => {
          const data = docSnap.data() as {
            content?: string;
            createdAt?: Timestamp | Date | null;
          } | null;
          const rawCreatedAt = data?.createdAt;
          let created: Date | null = null;
          if (rawCreatedAt instanceof Date) {
            created = rawCreatedAt;
          } else if (
            rawCreatedAt &&
            typeof rawCreatedAt.toDate === "function"
          ) {
            try {
              created = rawCreatedAt.toDate();
            } catch (err) {
              console.warn("Failed to parse comment timestamp", err);
            }
          }
          return {
            id: docSnap.id,
            text: data?.content ?? "",
            createdAt: created,
          } satisfies Comment;
        });
        setComments(next);
      },
      (error) => {
        console.error("Failed to load comments", error);
      },
    );

    return () => {
      unsubDoc();
      unsubComments();
    };
  }, [firebaseReady, contentId]);

  useEffect(() => {
    if (!firebaseReady || !contentId || !user || authLoading) {
      if (!isAuthenticated && !authLoading) {
        setLiked(false);
      }
      setLikeLoading(false);
      return;
    }

    setLikeLoading(true);
    const db = getFirestoreDb();
    const likeRef = doc(db, "users", user.uid, "likes", contentId);
    const unsubscribe = onSnapshot(
      likeRef,
      (snapshot) => {
        const exists = snapshot.exists();
        setLiked(exists);
        setLikeLoading(false);
      },
      (error) => {
        console.error("Failed to load user like state", error);
        setLikeLoading(false);
      },
    );
    return () => unsubscribe();
  }, [firebaseReady, contentId, user, authLoading, isAuthenticated]);

  const placeholder = useMemo(() => {
    if (liked) return commentText.placeholderLiked;
    if (comments.length === 0) return commentText.placeholderEmpty;
    return commentText.placeholderDefault;
  }, [liked, comments.length, commentText]);

  const ensurePosterStored = useCallback(async () => {
    if (!contentId) {
      throw new Error("Missing contentId for poster upload");
    }
    if (!firebaseReady) {
      throw new Error("Firebase is not configured");
    }
    const storagePath = `posters/${contentId}.webp`;
    const storageRef = getStorageRef(storagePath);

    try {
      await getMetadata(storageRef);
      return storagePath;
    } catch (error) {
      const fbError = error as FirebaseError;
      if (!fbError?.code || fbError.code !== "storage/object-not-found") {
        throw error;
      }
    }

    const sourceUrl = posterProxyUrl;
    if (!sourceUrl) {
      throw new Error("Poster image URL is missing");
    }
    const response = await fetch(sourceUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch poster image: ${response.status}`);
    }
    const blob = await response.blob();
    let uploadBlob = blob;
    try {
      uploadBlob = await convertBlobToWebp(blob);
    } catch (error) {
      console.warn(
        "Failed to convert poster to WebP; uploading original",
        error,
      );
    }
    const contentType = uploadBlob.type || "image/webp";
    await uploadBytes(storageRef, uploadBlob, { contentType });
    return storagePath;
  }, [contentId, firebaseReady, posterProxyUrl]);

  const updateLikeDocument = useCallback(
    async (delta: number) => {
      if (!firebaseReady || !contentId) return;
      const db = getFirestoreDb();
      const baseDocRef = doc(db, "avs", contentId);
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(baseDocRef);
        if (!snapshot.exists()) {
          transaction.set(baseDocRef, {
            likeCount: delta > 0 ? delta : 0,
            createdAt: serverTimestamp(),
          });
          return;
        }
        const data = snapshot.data();
        const current =
          data && typeof data.likeCount === "number" ? data.likeCount : 0;
        const next = Math.max(0, current + delta);
        const payload: Record<string, unknown> = { likeCount: next };
        if (!data?.createdAt) {
          payload.createdAt = serverTimestamp();
        }
        transaction.update(baseDocRef, payload);
      });
    },
    [firebaseReady, contentId],
  );

  const handleToggleLike = useCallback(async () => {
    if (authLoading || likeLoading) return;
    if (!contentId) return;
    if (!firebaseReady) {
      console.warn("Firebase configuration missing; cannot like");
      return;
    }

    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    if (nextLiked) {
      setPopKey((key) => key + 1);
    }
    setLikeLoading(true);

    try {
      const db = getFirestoreDb();
      const userLikeRef = doc(db, "users", user.uid, "likes", contentId);
      if (nextLiked) {
        const imagePath = await ensurePosterStored();
        await updateLikeDocument(1);
        await setDoc(userLikeRef, {
          imagePath,
          affiliateUrl: affiliateUrl ?? affiliate ?? "",
          likedAt: serverTimestamp(),
        });
      } else {
        await updateLikeDocument(-1);
        await deleteDoc(userLikeRef);
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
      setLiked((previous) => {
        if (nextLiked === previous) {
          return !nextLiked;
        }
        return previous;
      });
    } finally {
      setLikeLoading(false);
    }
  }, [
    affiliate,
    affiliateUrl,
    authLoading,
    contentId,
    ensurePosterStored,
    firebaseReady,
    isAuthenticated,
    likeLoading,
    liked,
    router,
    updateLikeDocument,
    user,
  ]);

  const handleCommentSubmit: React.FormEventHandler<HTMLFormElement> =
    useCallback(
      async (event) => {
        event.preventDefault();
        const value = pending.trim();
        if (!value) return;

        if (!firebaseReady || !contentId) {
          setComments((prev) => [
            ...prev,
            {
              id:
                typeof crypto !== "undefined" && "randomUUID" in crypto
                  ? crypto.randomUUID()
                  : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              text: value,
              createdAt: new Date(),
            },
          ]);
          setPending("");
          return;
        }

        setSubmitting(true);
        try {
          const db = getFirestoreDb();
          const baseDocRef = doc(db, "avs", contentId);
          const snapshot = await getDoc(baseDocRef);
          if (!snapshot.exists()) {
            await setDoc(baseDocRef, {
              likeCount: 0,
              createdAt: serverTimestamp(),
            });
          } else if (!snapshot.data()?.createdAt) {
            await updateDoc(baseDocRef, { createdAt: serverTimestamp() });
          }
          await addDoc(collection(baseDocRef, "comments"), {
            content: value,
            createdAt: serverTimestamp(),
          });
          setPending("");
        } catch (error) {
          console.error("Failed to submit comment", error);
        } finally {
          setSubmitting(false);
        }
      },
      [contentId, firebaseReady, pending],
    );

  const actressFadeStyle: CSSProperties | undefined = useMemo(() => {
    if (!actressNames) return undefined;
    const visibleLength = actressNames.replace(/\s+/g, "").length;
    if (visibleLength <= 8) return undefined;
    return {
      WebkitMaskImage:
        "linear-gradient(90deg, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
      maskImage:
        "linear-gradient(90deg, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%)",
    };
  }, [actressNames]);

  const dateOnly = (releaseDate || "").slice(0, 10);
  const heartFontSize = 52;

  return (
    <aside ref={ref} className={containerClass} style={cardStyle}>
      <header className="info-panel__header">
        <div className="info-panel__title">
          {actressNames ? (
            <div className="info-panel__actors" style={actressFadeStyle}>
              {actressNames}
            </div>
          ) : null}
          {title ? (
            <h2 className="info-panel__name">
              {affiliate ? (
                <a href={affiliate} target="_blank" rel="noopener noreferrer">
                  {title}
                </a>
              ) : (
                title
              )}
            </h2>
          ) : null}
        </div>
        <div className="info-panel__actions">
          <button
            type="button"
            aria-label={liked ? commentText.unlikeAria : commentText.likeAria}
            aria-pressed={liked}
            onClick={() => {
              void handleToggleLike();
            }}
            className="info-panel__like"
            style={{ fontSize: `${heartFontSize}px` }}
            disabled={likeLoading || authLoading}
          >
            <span
              className={`info-panel__like-icon info-panel__like-icon--outline ${
                liked ? "info-panel__like-icon--hidden" : ""
              }`}
            >
              <MaterialSymbolsLightFavoriteOutline />
            </span>
            <span
              key={popKey}
              className={`info-panel__like-icon info-panel__like-icon--solid ${
                liked ? "info-panel__like-icon--visible" : ""
              }`}
            >
              <MaterialSymbolsLightFavorite />
            </span>
          </button>
          <span className="info-panel__like-count">{likeCount}</span>
        </div>
      </header>

      <section className="info-panel__meta">
        <dl>
          <div className="info-panel__meta-row">
            <dt>{infoText.releaseDate}</dt>
            <dd>{dateOnly || "--"}</dd>
          </div>
          {contentId ? (
            <div className="info-panel__meta-row">
              <dt>{infoText.contentId}</dt>
              <dd>{contentId}</dd>
            </div>
          ) : null}
          {makerName ? (
            <div className="info-panel__meta-row">
              <dt>{infoText.maker}</dt>
              <dd>{makerName}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="info-panel__comments">
        <div className="info-panel__comment-list">
          {comments.length === 0 ? (
            <p className="info-panel__comment-empty">
              {commentText.noComments}
            </p>
          ) : (
            comments.map((comment) => (
              <article key={comment.id} className="info-panel__comment">
                <p>{comment.text}</p>
                {comment.createdAt && timeFormatter ? (
                  <time className="info-panel__comment-time">
                    {timeFormatter.format(comment.createdAt)}
                  </time>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      <form className="info-panel__form" onSubmit={handleCommentSubmit}>
        <label className="sr-only" htmlFor="comment-input">
          {commentText.addLabel}
        </label>
        <input
          id="comment-input"
          type="text"
          value={pending}
          onChange={(event) => setPending(event.target.value)}
          placeholder={placeholder}
          className="info-panel__input"
        />
        <button
          type="submit"
          className="info-panel__submit"
          disabled={submitting || !pending.trim()}
        >
          {submitting ? commentText.submitting : commentText.submit}
        </button>
      </form>
    </aside>
  );
});

export default InfoPanel;
