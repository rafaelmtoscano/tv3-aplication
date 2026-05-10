// TODO: substituir por persistência via API de perfil quando disponível

export type FontScale = 'normal' | 'large' | 'xlarge';

export const FONT_SCALES: Record<FontScale, { label: string; value: number }> = {
  normal: { label: 'Normal', value: 1.0 },
  large: { label: 'Grande', value: 1.15 },
  xlarge: { label: 'Muito grande', value: 1.3 },
};

export interface Region {
  uf: string;
  name: string;
}

export const BRAZILIAN_STATES: Region[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

export const DEFAULT_CHANNELS: Array<{ id: string; name: string }> = [
  { id: 'tv-camara', name: 'TV Câmara' },
  { id: 'tv-brasil', name: 'TV Brasil' },
  { id: 'canal-gov', name: 'Canal Gov' },
  { id: 'tv-senado', name: 'TV Senado' },
  { id: 'tv-justica', name: 'TV Justiça' },
  { id: 'tv-mec', name: 'TV MEC' },
];

export interface AppSettings {
  fontScale: FontScale;
  highContrast: boolean;
  ccEnabled: boolean;
  librasEnabled: boolean;
  audioDescriptionEnabled: boolean;
  analyticsEnabled: boolean;
  region: string | null;
  defaultChannelId: string | null;
}

export const DEFAULT_SETTINGS: AppSettings = {
  fontScale: 'normal',
  highContrast: false,
  ccEnabled: false,
  librasEnabled: false,
  audioDescriptionEnabled: false,
  analyticsEnabled: true,
  region: null,
  defaultChannelId: null,
};

export const SETTINGS_STORAGE_KEY = 'tv3:settings:v1';
