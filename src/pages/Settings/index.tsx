import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { useSettings } from '../../context/SettingsContext';
import type { AppSettings, FontScale } from '../../data/settings';
import { BRAZILIAN_STATES, DEFAULT_CHANNELS, FONT_SCALES } from '../../data/settings';

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

interface RadioControl extends ControlBase {
  kind: 'radio';
  key: keyof AppSettings;
  options: Array<{ value: string; label: string }>;
}

interface SelectControl extends ControlBase {
  kind: 'select';
  key: keyof AppSettings;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
}

type Control = ToggleControl | RadioControl | SelectControl;

const SECTIONS: Array<{ id: SectionId; label: string }> = [
  { id: 'accessibility', label: 'Acessibilidade' },
  { id: 'content', label: 'Conteúdo' },
  { id: 'privacy', label: 'Privacidade' },
];

export default function Settings({ isActive }: Props) {
  const { settings, updateSetting } = useSettings();

  const [sectionIndex, setSectionIndex] = useState(0);
  const [column, setColumn] = useState<'sections' | 'controls'>('sections');
  const [controlIndex, setControlIndex] = useState(0);
  const [openSelect, setOpenSelect] = useState<null | {
    key: keyof AppSettings;
    options: Array<{ value: string; label: string }>;
    index: number;
  }>(null);

  const controlsBySection = useMemo<Record<SectionId, Control[]>>(() => ({
    accessibility: [
      {
        kind: 'radio',
        id: 'fontScale',
        key: 'fontScale',
        label: 'Tamanho do texto',
        options: (Object.keys(FONT_SCALES) as FontScale[]).map((k) => ({
          value: k,
          label: FONT_SCALES[k].label,
        })),
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

  // Reset control index when changing section
  useEffect(() => {
    setControlIndex(0);
  }, [sectionIndex]);

  const moveControlIndex = useCallback((delta: 1 | -1) => {
    setControlIndex((prev) => {
      let next = prev + delta;
      while (next >= 0 && next < controls.length && controls[next].disabled) {
        next += delta;
      }
      if (next < 0 || next >= controls.length) return prev;
      return next;
    });
  }, [controls]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handler = (e: KeyboardEvent) => {
      // Drawer takes precedence
      if (openSelect) {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'ArrowDown') {
          setOpenSelect((s) => s && {
            ...s,
            index: Math.min(s.index + 1, s.options.length - 1),
          });
        } else if (e.key === 'ArrowUp') {
          setOpenSelect((s) => s && { ...s, index: Math.max(s.index - 1, 0) });
        } else if (e.key === 'Enter') {
          const sel = openSelect.options[openSelect.index];
          if (sel) {
            updateSetting(openSelect.key, sel.value as never);
          }
          setOpenSelect(null);
        } else if (e.key === 'Escape' || e.key === 'Backspace') {
          setOpenSelect(null);
        }
        return;
      }

      if (column === 'sections') {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSectionIndex((i) => Math.min(i + 1, SECTIONS.length - 1));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSectionIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
          e.preventDefault();
          setColumn('controls');
        }
        return;
      }

      // column === 'controls'
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setColumn('sections');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveControlIndex(1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveControlIndex(-1);
        return;
      }

      const ctrl = controls[controlIndex];
      if (!ctrl || ctrl.disabled) return;

      if (ctrl.kind === 'radio') {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const currentValue = settings[ctrl.key] as string;
          const idx = ctrl.options.findIndex((o) => o.value === currentValue);
          const next = ctrl.options[Math.min(idx + 1, ctrl.options.length - 1)];
          if (next) updateSetting(ctrl.key, next.value as never);
        }
      } else if (ctrl.kind === 'toggle') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const cur = settings[ctrl.key] as boolean;
          updateSetting(ctrl.key, !cur as never);
        }
      } else if (ctrl.kind === 'select') {
        if (e.key === 'Enter') {
          e.preventDefault();
          const currentValue = settings[ctrl.key] as string | null;
          const idx = Math.max(0, ctrl.options.findIndex((o) => o.value === currentValue));
          setOpenSelect({ key: ctrl.key, options: ctrl.options, index: idx });
        }
      }
    };

    window.addEventListener('keydown', handler, { capture: true });
    return () => window.removeEventListener('keydown', handler, { capture: true });
  }, [isActive, column, controls, controlIndex, openSelect, settings, updateSetting, moveControlIndex]);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
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
  };

  const sectionItemStyle = (focused: boolean, active: boolean): React.CSSProperties => ({
    padding: '16px 20px',
    borderRadius: 16,
    background: active ? colors.surface.overlayMuted : 'transparent',
    border: `2px solid ${focused ? colors.text.primaryInverse : 'transparent'}`,
    color: colors.text.primaryInverse,
    ...typography.body.large,
    transform: focused ? 'scale(1.02)' : 'scale(1)',
    transition: 'transform 0.15s ease, border-color 0.15s ease',
  });

  const controlsColumnStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Configurações</h1>

      <div style={layoutStyle}>
        <div style={sectionsColumnStyle}>
          {SECTIONS.map((s, i) => (
            <div
              key={s.id}
              style={sectionItemStyle(column === 'sections' && sectionIndex === i, sectionIndex === i)}
            >
              {s.label}
            </div>
          ))}
        </div>

        <div style={controlsColumnStyle}>
          {controls.map((ctrl, i) => (
            <ControlRow
              key={ctrl.id}
              control={ctrl}
              focused={column === 'controls' && controlIndex === i}
              settings={settings}
            />
          ))}
        </div>
      </div>

      {openSelect && (
        <SelectDrawer
          options={openSelect.options}
          activeIndex={openSelect.index}
          onClose={() => setOpenSelect(null)}
        />
      )}
    </div>
  );
}

// ── Control row ─────────────────────────────────────────────────────────────

function ControlRow({
  control,
  focused,
  settings,
}: {
  control: Control;
  focused: boolean;
  settings: AppSettings;
}) {
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
    <div style={rowStyle}>
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
  if (control.kind === 'radio') {
    const value = settings[control.key] as string;
    return <RadioGroup options={control.options} value={value} focused={focused} />;
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
      {selected ? selected.label : control.placeholder} ▼
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

// ── RadioGroup ──────────────────────────────────────────────────────────────

function RadioGroup({
  options,
  value,
  focused,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  focused: boolean;
}) {
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    gap: 8,
    padding: 4,
    borderRadius: 100,
    background: colors.surface.overlayMuted,
    border: `2px solid ${focused ? colors.text.primaryInverse : 'transparent'}`,
  };
  return (
    <div style={wrapperStyle}>
      {options.map((opt) => {
        const selected = opt.value === value;
        const chipStyle: React.CSSProperties = {
          padding: '8px 16px',
          borderRadius: 100,
          background: selected ? colors.background.brandPrimary : 'transparent',
          color: selected ? colors.text.primary : colors.text.primaryInverse,
          ...typography.label.small,
          fontWeight: 600,
        };
        return (
          <span key={opt.value} style={chipStyle}>
            {opt.label}
          </span>
        );
      })}
    </div>
  );
}

// ── Select drawer ───────────────────────────────────────────────────────────

function SelectDrawer({
  options,
  activeIndex,
  onClose,
}: {
  options: Array<{ value: string; label: string }>;
  activeIndex: number;
  onClose: () => void;
}) {
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 400,
  };
  const panelStyle: React.CSSProperties = {
    background: '#11172B',
    border: `4px solid rgba(255, 255, 255, 0.08)`,
    borderRadius: 24,
    width: 480,
    maxHeight: '70vh',
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  };
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        {options.map((opt, i) => {
          const focused = i === activeIndex;
          const itemStyle: React.CSSProperties = {
            padding: '12px 16px',
            borderRadius: 12,
            background: focused ? colors.background.brandPrimary : 'transparent',
            color: focused ? colors.text.primary : colors.text.primaryInverse,
            ...typography.body.medium,
          };
          return (
            <div
              key={opt.value}
              style={itemStyle}
              ref={(el) => {
                if (focused && el) el.scrollIntoView({ block: 'nearest' });
              }}
            >
              {opt.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
