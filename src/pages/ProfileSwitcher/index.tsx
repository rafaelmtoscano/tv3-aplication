import { useCallback, useEffect, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import type { GovBrProfile } from '../../data/govBrProfiles';

interface ProfileSwitcherProps {
  profiles: GovBrProfile[];
  activeProfileId: string;
  onSelect: (profile: GovBrProfile) => void;
  onManageAccount: () => void;
  onBack: () => void;
}

type FocusZone = 'avatars' | 'manage';

export default function ProfileSwitcher({
  profiles,
  activeProfileId,
  onSelect,
  onManageAccount,
  onBack,
}: ProfileSwitcherProps) {
  const [focusZone, setFocusZone] = useState<FocusZone>('avatars');
  const [focusedIndex, setFocusedIndex] = useState<number>(() => {
    const idx = profiles.findIndex((p) => p.id === activeProfileId);
    return idx >= 0 ? idx : 0;
  });

  const handlersRef = useRef({ onSelect, onManageAccount, onBack });
  handlersRef.current = { onSelect, onManageAccount, onBack };

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      e.stopImmediatePropagation();
      e.preventDefault();
      handlersRef.current.onBack();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (focusZone === 'avatars') {
        setFocusedIndex((i) => Math.max(0, i - 1));
      }
      return;
    }
    if (e.key === 'ArrowRight') {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (focusZone === 'avatars') {
        setFocusedIndex((i) => Math.min(profiles.length - 1, i + 1));
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (focusZone === 'avatars') setFocusZone('manage');
      return;
    }
    if (e.key === 'ArrowUp') {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (focusZone === 'manage') setFocusZone('avatars');
      return;
    }
    if (e.key === 'Enter') {
      e.stopImmediatePropagation();
      e.preventDefault();
      if (focusZone === 'avatars') {
        const profile = profiles[focusedIndex];
        if (profile) handlersRef.current.onSelect(profile);
      } else {
        handlersRef.current.onManageAccount();
      }
    }
  }, [focusZone, focusedIndex, profiles]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey, { capture: true });
    return () => window.removeEventListener('keydown', handleKey, { capture: true });
  }, [handleKey]);

  return (
    <div className="profile-switcher">
      <style>{`
        .profile-switcher {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 64px;
          padding: 80px 120px;
          background: ${colors.background.baseInverse};
        }
        .profile-switcher__title {
          margin: 0;
          color: ${colors.text.primaryInverse};
        }
        .profile-switcher__list {
          display: flex;
          gap: 48px;
          align-items: flex-start;
          justify-content: center;
        }
        .profile-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          color: inherit;
          transition: transform 0.2s ease;
        }
        .profile-card__avatar {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
          background: ${colors.background.primaryInverse};
          outline: 4px solid transparent;
          outline-offset: 4px;
          transition: outline-color 0.2s ease, box-shadow 0.2s ease;
        }
        .profile-card--active .profile-card__avatar {
          box-shadow: 0 0 0 3px ${colors.background.brandPrimary} inset;
        }
        .profile-card--focused {
          transform: scale(1.05);
        }
        .profile-card--focused .profile-card__avatar {
          outline-color: #fff;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
        }
        .profile-card__name {
          margin: 0;
          color: ${colors.text.primaryInverse};
          text-align: center;
        }
        .profile-card--focused .profile-card__name {
          color: #fff;
        }
        .profile-card__relation {
          margin: 0;
          color: ${colors.text.secondaryInverse};
          text-align: center;
        }
        .profile-switcher__manage {
          padding: 18px 64px;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.25);
          background: transparent;
          color: ${colors.text.primaryInverse};
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .profile-switcher__manage--focused {
          background: ${colors.background.primary};
          color: ${colors.text.primary};
          transform: scale(1.05);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          border-color: transparent;
        }
        @media (max-width: 1100px) {
          .profile-switcher__list { gap: 32px; }
          .profile-card__avatar { width: 160px; height: 160px; }
        }
      `}</style>

      <h1 className="profile-switcher__title" style={typography.display.medium}>
        Quem está assistindo?
      </h1>

      <div className="profile-switcher__list" role="list">
        {profiles.map((profile, index) => {
          const isFocused = focusZone === 'avatars' && index === focusedIndex;
          const isActive = profile.id === activeProfileId;
          const cardClass =
            'profile-card' +
            (isFocused ? ' profile-card--focused' : '') +
            (isActive ? ' profile-card--active' : '');
          return (
            <button
              key={profile.id}
              type="button"
              role="listitem"
              className={cardClass}
              onMouseEnter={() => {
                setFocusZone('avatars');
                setFocusedIndex(index);
              }}
              onClick={() => onSelect(profile)}
            >
              <img
                className="profile-card__avatar"
                src={profile.avatar}
                alt={profile.name}
              />
              <h2 className="profile-card__name" style={typography.headline.small}>
                {profile.name}
              </h2>
              <p className="profile-card__relation" style={typography.body.small}>
                {profile.relation}
              </p>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className={
          'profile-switcher__manage' +
          (focusZone === 'manage' ? ' profile-switcher__manage--focused' : '')
        }
        style={{ ...typography.body.large, fontWeight: 600 }}
        onMouseEnter={() => setFocusZone('manage')}
        onClick={onManageAccount}
      >
        Gerenciar conta
      </button>
    </div>
  );
}
