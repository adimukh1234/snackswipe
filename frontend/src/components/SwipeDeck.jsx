import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import '../styles/swipe.css';
import axios from 'axios';

function detectMediaType(url) {
  if (!url || typeof url !== 'string') return 'unknown';
  const clean = url.split('?')[0].toLowerCase();
  const imgExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'];
  if (imgExt.some(ext => clean.endsWith(ext))) return 'image';
  const vidExt = ['.mp4', '.webm', '.ogg', '.mov', '.m4v'];
  if (vidExt.some(ext => clean.endsWith(ext))) return 'video';
  return 'video';
}

// ADD: robust token getter (supports common keys and cookie fallback)
function getAccessToken() {
  const keys = ['token', 'authToken', 'accessToken', 'userToken'];
  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  // try user object
  try {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      if (u?.token) return u.token;
      if (u?.accessToken) return u.accessToken;
    }
  } catch {}
  // try cookie named token
  const m = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
  if (m) return decodeURIComponent(m[1]);
  return '';
}

export default function SwipeDeck() {
  // Start empty; we only show DB data
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null); // null | 'like' | 'skip'
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 300], [-15, 15]);
  const opacityLike = useTransform(x, [80, 140], [0, 1]);
  const opacitySkip = useTransform(x, [-140, -80], [1, 0]);
  const topRef = useRef(null);
  const rootRef = useRef(null);

  function handleDragEnd(e, info) {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = 120;
    if (offset > threshold || velocity > 500) {
      setAction('like');
    } else if (offset < -threshold || velocity < -500) {
      setAction('skip');
    }
  }

  function afterExit() {
    setCards(prev => prev.slice(1));
    setAction(null);
    x.set(0);
  }

  function handleManual(a) {
    setAction(a);
  }

  async function handleReload() {
    setAction(null);
    x.set(0);
    await fetchFoods();
  }

  // Keyboard shortcuts for accessibility
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (action) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setAction('skip');
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setAction('like');
      }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [action]);

  // Fetch food items from backend
  async function fetchFoods() {
    try {
      setLoading(true);
      setError(null);
      const token = getAccessToken();
      const res = await axios.get('http://localhost:3000/api/food/', {
        withCredentials: true, // allows httpOnly cookie auth if used
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const items = res?.data?.foodItems || res?.data || [];
      const mapped = items.map((it) => {
        const mediaUrl = it.video || '';
        return {
          id: it._id,
          name: it.name,
          description: it.description || '',
          mediaUrl,
          mediaType: detectMediaType(mediaUrl),
          foodpartner: it.foodpartner || null,
        };
      });
      setCards(mapped);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.statusText || err.message || 'Failed to load';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFoods();
  }, []);

  function shortId(id) {
    if (!id || typeof id !== 'string') return '';
    return id.slice(0, 4) + '…' + id.slice(-4);
  }

  return (
    <div className="swipe-root" ref={rootRef} tabIndex={0} aria-label="Swipe deck">
      <div className="bg-grid" aria-hidden="true" />
      <div className="swipe-container">
        <div className="logo-wrap" aria-label="Snack Swipe logo">
          <img
            className="app-logo"
            src="/logo-no-bg.png"
            alt="Snack Swipe"
          />
        </div>
        <div className="swipe-stack">
          {loading && (
            <div className="no-more" role="status" aria-live="polite"><p>Loading dishes…</p></div>
          )}
          {!loading && error && (
            <div className="no-more" role="alert"><p>{String(error)}</p></div>
          )}
          {cards.length === 0 && (
            <div className="no-more">
              <h2>No more dishes 🍽️</h2>
              <p>We've shown you everything for now.</p>
              <div className="row">
                <button className="btn" onClick={handleReload}>Reload</button>
              </div>
            </div>
          )}

          {cards.slice(0, 4).map((dish, i) => {
            const isTop = i === 0;
            const scale = 1 - i * 0.05;
            const translateY = i * 16;
            const baseOpacity = Math.max(0.7, 1 - i * 0.1);

            const topAnimate = action === 'like'
              ? { x: 500, rotate: 18, opacity: 0 }
              : action === 'skip'
              ? { x: -500, rotate: -18, opacity: 0 }
              : { x, rotate, opacity: baseOpacity, y: translateY, scale };

            return (
              <motion.div
                key={dish.id}
                className={`card ${isTop ? 'top' : 'under'}`}
                ref={isTop ? topRef : null}
                style={isTop ? { zIndex: 10 } : { zIndex: 9 - i }}
                drag={isTop && !action ? 'x' : false}
                dragElastic={0.16}
                onDragEnd={isTop ? handleDragEnd : undefined}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={isTop ? topAnimate : { opacity: baseOpacity, y: translateY, scale }}
                transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
                onAnimationComplete={() => {
                  if (isTop && (action === 'like' || action === 'skip')) {
                    afterExit();
                  }
                }}
              >
                <div className="card-media">
                  {dish.mediaType === 'image' && dish.mediaUrl ? (
                    <img className="media-image" src={dish.mediaUrl} alt={dish.name} />
                  ) : dish.mediaUrl ? (
                    <video className="media-video" src={dish.mediaUrl} muted autoPlay loop playsInline />
                  ) : (
                    <div className="media-fallback" />
                  )}
                  <div className="media-overlay" />
                  <div className="match-pill">{dish.mediaType === 'image' ? 'Food Image' : 'Food Video'}</div>
                </div>

                <div className="card-info">
                  <div className="title-block">
                    <h3 className="dish-name">{dish.name}</h3>
                    {dish.description && <p className="restaurant">{dish.description}</p>}
                  </div>
                  <div className="chips">
                    <span className="chip">{dish.mediaType === 'image' ? 'Image' : 'Video'}</span>
                    {dish.foodpartner && <span className="chip">FP {shortId(dish.foodpartner)}</span>}
                  </div>
                </div>

                {isTop && (
                  <>
                    <motion.div className="badge like" style={{ opacity: opacityLike }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M12.1 21.35l-1.1-1.02C5.14 15.24 2 12.36 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.1 2.44C11.09 5 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.86-3.14 6.74-8.9 11.83l-1.1 1.02z" fill="currentColor"/>
                      </svg>
                      <span>Liked</span>
                    </motion.div>
                    <motion.div className="badge skip" style={{ opacity: opacitySkip }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z" fill="currentColor"/>
                      </svg>
                      <span>Skipped</span>
                    </motion.div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {cards.length > 0 && (
          <div className="controls">
            <button className="btn circle skip-btn" aria-label="Skip" onClick={() => handleManual('skip')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z" fill="currentColor"/>
              </svg>
            </button>
            <button className="btn circle extra-btn" aria-label="Extra" disabled>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8h16zm0-2H4l1.34-4.02A2 2 0 0 1 7.26 4h9.48a2 2 0 0 1 1.92 1.98L20 10z" fill="currentColor"/>
              </svg>
            </button>
            <button className="btn circle like-btn" aria-label="Like" onClick={() => handleManual('like')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12.1 21.35l-1.1-1.02C5.14 15.24 2 12.36 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1 4.1 2.44C11.09 5 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.86-3.14 6.74-8.9 11.83l-1.1 1.02z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
