import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { useSettings } from '../../context/SettingsContext';
import type { AppSettings } from '../../data/settings';
import { BRAZILIAN_STATES, DEFAULT_CHANNELS } from '../../data/settings';

interface Props {
  isActive: boolean;
}

type SectionId = 'accessibility' | 'content' | 'privacy';

interface ControlBase {
  id: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}

interface ToggleControl extends ControlBase {
  kind: 'toggle';
  key: keyof AppSettings;
}

interface SelectControl extends ControlBase {
  kind: 'select';
  key: keyof AppSettings;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}

type Control = ToggleControl | SelectControl;

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'accessibility', label: 'Acessibilidade' },
  { id: 'content', label: 'Conteúdo' },
  { id: 'privacy', label: 'Privacidade' },
];

export default function Settings({ isActive }: Props) {
  const { settings, updateSetting } = useSettings();

  const containerRef = useRef<HTMLDivElement>(null);

  const [sectionIndex, setSectionIndex] = useState(0);
  const [controlIndex, setControlIndex] = useState(0);
  const [openSheet, setOpenSheet] = useState<null | {
    title: string;
    key: keyof AppSettings;
    options: Array<{ value: string; label: string }>;
    index: number;
    focus: 'list' | 'confirm' | 'cancel';
  }>(null);

  const controlsBySection = useMemo<Record<SectionId, Control[]>>(() => ({
    accessibility: [
      {
        kind: 'toggle',
        id: 'largeText',
        key: 'largeText',
        label: 'Texto grande',
        hint: 'Aumenta o texto em 15%',
      },
      { kind: 'toggle', id: 'highContrast', key: 'highContrast', label: 'Alto contraste' },
      { kind: 'toggle', id: 'ccEnabled', key: 'ccEnabled', label: 'Closed Caption' },
      { kind: 'toggle', id: 'librasEnabled', key: 'librasEnabled', label: 'Libras (VLibras)' },
      {
        kind: 'toggle',
        id: 'audioDescription',
        key: 'audioDescriptionEnabled',
        label: 'Audiodescrição',
        disabled: true,
        hint: 'Em breve',
      },
    ],
    content: [
      {
        kind: 'select',
        id: 'region',
        key: 'region',
        label: 'Estado / Região',
        placeholder: 'Selecionar estado',
        options: BRAZILIAN_STATES.map((s) => ({ value: s.uf, label: `${s.name} (${s.uf})` })),
      },
      {
        kind: 'select',
        id: 'defaultChannel',
        key: 'defaultChannelId',
        label: 'Canal padrão',
        placeholder: 'Selecionar canal',
        options: DEFAULT_CHANNELS.map((c) => ({ value: c.id, label: c.name })),
      },
    ],
    privacy: [
      { kind: 'toggle', id: 'analytics', key: 'analyticsEnabled', label: 'Analytics LGPD' },
    ],
  }), []);

  const activeSection = SECTIONS[sectionIndex].id;
  const controls = controlsBySection[activeSection];

  const findEnabled = useCallback(
    (list: Control[], start: number, dir: 1 | -1): number => {
      let i = start;
      while (i >= 0 && i < list.length && list[i].disabled) i += dir;
      if (i < 0 || i >= list.length) return -1;
      return i;
    },
    [],
  );

  const goToSection = useCallback(
    (newSectionIdx: number, fromTop: boolean) => {
      const list = controlsBySection[SECTIONS[newSectionIdx].id];
      const idx = fromTop
        ? findEnabled(list, 0, 1)
        : findEnabled(list, list.length - 1, -1);
      setSectionIndex(newSectionIdx);
      setControlIndex(idx >= 0 ? idx : 0);
    },
    [controlsBySection, findEnabled],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handler = (e: KeyboardEvent) => {
      // Side sheet has full focus
      if (openSheet) {
        e.preventDefault();
        e.stopPropagation();
        if (openSheet.focus === 'list') {
          if (e.key === 'ArrowDown') {
            setOpenSheet((s) =>
              s && { ...s, index: Math.min(s.index + 1, s.options.length - 1) },
            );
          } else if (e.key === 'ArrowUp') {
            setOpenSheet((s) => s && { ...s, index: Math.max(s.index - 1, 0) });
          } else if (e.key === 'Enter') {
            setOpenSheet((s) => s && { ...s, focus: 'confirm' });
          } else if (e.key === 'Escape' || e.key === 'ArrowLeft' || e.key === 'Backspace') {
            setOpenSheet(null);
          }
        } else {
          // confirm / cancel buttons
          if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            setOpenSheet((s) =>
              s && { ...s, focus: s.focus === 'confirm' ? 'cancel' : 'confirm' },
            );
          } else if (e.key === 'ArrowUp') {
            setOpenSheet((s) => s && { ...s, focus: 'list' });
          } else if (e.key === 'Enter') {
            if (openSheet.focus === 'confirm') {
              const sel = openSheet.options[openSheet.index];
              if (sel) updateSetting(openSheet.key, sel.value as never);
            }
            setOpenSheet(null);
          } else if (e.key === 'Escape' || e.key === 'Backspace') {
            setOpenSheet(null);
          }
        }
        return;
      }

      const ctrl = controls[controlIndex];

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = findEnabled(controls, controlIndex + 1, 1);
        if (next >= 0) {
          setControlIndex(next);
        } else if (sectionIndex < SECTIONS.length - 1) {
          goToSection(sectionIndex + 1, true);
        }
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = findEnabled(controls, controlIndex - 1, -1);
        if (prev >= 0) {
          setControlIndex(prev);
        } else if (sectionIndex > 0) {
          goToSection(sectionIndex - 1, false);
        }
        return;
      }

      if (!ctrl || ctrl.disabled) return;

      if (ctrl.kind === 'toggle') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const cur = settings[ctrl.key] as boolean;
          updateSetting(ctrl.key, !cur as never);
        }
      } else if (ctrl.kind === 'select') {
        if (e.key === 'Enter' || e.key === 'ArrowRight') {
          e.preventDefault();
          const currentValue = settings[ctrl.key] as string | null;
          const idx = Math.max(0, ctrl.options.findIndex((o) => o.value === currentValue));
          setOpenSheet({
            title: ctrl.label,
            key: ctrl.key,
            options: ctrl.options,
            index: idx,
            focus: 'list',
          });
        }
      }
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true } as never);
  }, [isActive, controls, controlIndex, sectionIndex, openSheet, settings, updateSetting, findEnabled, goToSection]);

  // Scroll behavior: when first global item focused, scroll container to top
  useEffect(() => {
    if (sectionIndex === 0 && controlIndex === 0) {
      containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [sectionIndex, controlIndex]);

  const containerStyle: React.CSSProperties = {
    height: '100vh',
    overflowY: 'auto',
    background: colors.background.baseInverse,
    padding: '64px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
  };

  const titleStyle: React.CSSProperties = {
    ...typography.display.medium,
    color: colors.text.primaryInverse,
  };

  const layoutStyle: React.CSSProperties = {
    display: 'flex',
    gap: 48,
    flex: 1,
  };

  const sectionsColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: 280,
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
  };

  const sectionItemStyle = (active: boolean): React.CSSProperties => ({
    padding: '16px 20px',
    borderRadius: 16,
    background: active ? colors.surface.overlayMuted : 'transparent',
    color: colors.text.primaryInverse,
    ...typography.body.large,
    opacity: active ? 1 : 0.6,
    transition: 'opacity 0.15s ease, background 0.15s ease',
  });

  const controlsColumnStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  };

  return (
    <div ref={containerRef} style={containerStyle}>
      <h1 style={titleStyle}>Configurações</h1>

      <div style={layoutStyle}>
        <div style={sectionsColumnStyle}>
          {SECTIONS.map((s, i) => (
            <div key={s.id} style={sectionItemStyle(sectionIndex === i)}>
              {s.label}
            </div>
          ))}
        </div>

        <div style={controlsColumnStyle}>
          {controls.map((ctrl, i) => (
            <ControlRow
              key={ctrl.id}
              control={ctrl}
              focused={controlIndex === i}
              isFirstOverall={sectionIndex === 0 && i === 0}
              settings={settings}
            />
          ))}
        </div>
      </div>

      {openSheet && (
        <SelectSideSheet
          title={openSheet.title}
          options={openSheet.options}
          activeIndex={openSheet.index}
          focus={openSheet.focus}
          currentValue={settings[openSheet.key] as string | null}
          onClose={() => setOpenSheet(null)}
        />
      )}
    </div>
  );
}

// ── Control row ─────────────────────────────────────────────────────────────

function ControlRow({
  control,
  focused,
  isFirstOverall,
  settings,
}: {
  control: Control;
  focused: boolean;
  isFirstOverall: boolean;
  settings: AppSettings;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focused || !ref.current) return;
    if (isFirstOverall) return; // container scroll-to-top handles this
    ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [focused, isFirstOverall]);

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    padding: '20px 24px',
    borderRadius: 20,
    background: colors.surface.overlay,
    border: `2px solid ${focused ? colors.text.primaryInverse : 'transparent'}`,
    opacity: control.disabled ? 0.5 : 1,
    transform: focused ? 'scale(1.01)' : 'scale(1)',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    ...typography.body.large,
    color: colors.text.primaryInverse,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  };

  const hintStyle: React.CSSProperties = {
    ...typography.label.small,
    color: colors.text.secondaryInverse,
  };

  return (
    <div ref={ref} style={rowStyle} data-focused={focused ? 'true' : undefined}>
      <div style={labelStyle}>
        <span>{control.label}</span>
        {control.hint && <span style={hintStyle}>{control.hint}</span>}
      </div>
      <ControlWidget control={control} settings={settings} focused={focused} />
    </div>
  );
}

function ControlWidget({
  control,
  settings,
  focused,
}: {
  control: Control;
  settings: AppSettings;
  focused: boolean;
}) {
  if (control.kind === 'toggle') {
    const value = settings[control.key] as boolean;
    return <Toggle value={value} focused={focused} />;
  }
  // select
  const value = settings[control.key] as string | null;
  const selected = control.options.find((o) => o.value === value);
  return (
    <div style={{
      ...typography.body.medium,
      color: colors.text.primaryInverse,
      padding: '8px 16px',
      borderRadius: 12,
      background: colors.surface.overlayMuted,
      minWidth: 220,
      textAlign: 'right',
    }}>
      {selected ? selected.label : control.placeholder} ▸
    </div>
  );
}

// ── Toggle ──────────────────────────────────────────────────────────────────

function Toggle({ value, focused }: { value: boolean; focused: boolean }) {
  const trackStyle: React.CSSProperties = {
    width: 64,
    height: 32,
    borderRadius: 100,
    background: value ? colors.background.brandPrimary : colors.line.dark,
    position: 'relative',
    transition: 'background 0.2s ease',
    border: `2px solid ${focused ? colors.text.primaryInverse : 'transparent'}`,
  };
  const knobStyle: React.CSSProperties = {
    position: 'absolute',
    top: 2,
    left: value ? 32 : 2,
    width: 24,
    height: 24,
    borderRadius: '50%',
    background: '#FFF',
    transition: 'left 0.2s ease',
  };
  return (
    <div style={trackStyle}>
      <div style={knobStyle} />
    </div>
  );
}

// ── Side sheet ──────────────────────────────────────────────────────────────

function SelectSideSheet({
  title,
  options,
  activeIndex,
  focus,
  currentValue,
  onClose,
}: {
  title: string;
  options: Array<{ value: string; label: string }>;
  activeIndex: number;
  focus: 'list' | 'confirm' | 'cancel';
  currentValue: string | null;
  onClose: () => void;
}) {
  const scrimStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 399,
    animation: 'fadeIn 0.2s ease',
  };

  const sheetStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: 0,
    width: 480,
    height: '100vh',
    background: '#11172B',
    borderLeft: '4px solid rgba(255, 255, 255, 0.08)',
    padding: '32px 24px',
    zIndex: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    animation: 'slideInRight 0.25s ease',
  };

  const headerStyle: React.CSSProperties = {
    ...typography.headline.medium,
    color: colors.text.primaryInverse,
    paddingBottom: 12,
    borderBottom: `1px solid ${colors.line.dark}`,
  };

  const listStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '4px 0',
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    gap: 12,
    paddingTop: 16,
    borderTop: `1px solid ${colors.line.dark}`,
  };

  const buttonStyle = (isFocused: boolean, primary: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '12px 16px',
    borderRadius: 100,
    border: `2px solid ${isFocused ? colors.text.primaryInverse : 'transparent'}`,
    background: primary ? colors.background.brandPrimary : 'transparent',
    color: primary ? colors.text.primary : colors.text.primaryInverse,
    ...typography.label.small,
    fontWeight: 600,
    cursor: 'pointer',
    transform: isFocused ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  });

  return (
    <>
      <div style={scrimStyle} onClick={onClose} />
      <div style={sheetStyle}>
        <div style={headerStyle}>{title}</div>
        <div style={listStyle}>
          {options.map((opt, i) => {
            const isFocused = focus === 'list' && i === activeIndex;
            const isCurrent = opt.value === currentValue;
            const itemStyle: React.CSSProperties = {
              padding: '12px 16px',
              borderRadius: 12,
              background: isFocused
                ? colors.background.brandPrimary
                : isCurrent
                ? colors.surface.overlayMuted
                : 'transparent',
              color: isFocused ? colors.text.primary : colors.text.primaryInverse,
              ...typography.body.medium,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            };
            return (
              <div
                key={opt.value}
                style={itemStyle}
                ref={(el) => {
                  if (isFocused && el) el.scrollIntoView({ block: 'nearest' });
                }}
              >
                <span>{opt.label}</span>
                {isCurrent && <span>●</span>}
              </div>
            );
          })}
        </div>
        <div style={footerStyle}>
          <button type="button" style={buttonStyle(focus === 'confirm', true)}>
            Confirmar
          </button>
          <button type="button" style={buttonStyle(focus === 'cancel', false)}>
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
}
