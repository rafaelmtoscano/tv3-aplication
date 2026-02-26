# tv-catalog-ui

TV 10-foot UI component library — React + TypeScript + Vite.

## Setup

```bash
npm install
npm run dev
```

## Estrutura

```
src/
├── components/       # Componentes da lib
│   ├── ActionButton/
│   ├── CircleButton/
│   ├── ContentCard/
│   ├── ContentRail/
│   ├── ContentRailGroup/
│   ├── HeroBanner/
│   ├── LivePlayer/
│   ├── MenuItem/
│   ├── Sidebar/
│   ├── Sign/
│   ├── Text/
│   ├── TileButton/
│   └── VideoPlayer/
├── icons/            # Ícones SVG
├── pages/            # Páginas da aplicação
│   └── Home.tsx
├── styles/           # Tokens de design
│   ├── colors.ts
│   ├── typography.ts
│   └── tokens.css
├── index.ts          # Exports da lib
├── index.css         # Estilos globais
├── App.tsx
└── main.tsx
```

## Componentes disponíveis

| Componente | Descrição |
|---|---|
| `ActionButton` | Botão de ação com variantes text e icon-text |
| `CircleButton` | Botão circular com ícone |
| `ContentCard` | Card de conteúdo para carrossel (com foco TV) |
| `ContentRail` | Carrossel horizontal de ContentCards |
| `ContentRailGroup` | Grupo de ContentRails |
| `HeroBanner` | Banner hero com slides |
| `LivePlayer` | Player para transmissões ao vivo (HLS) |
| `MenuItem` | Item de menu lateral |
| `Sidebar` | Menu lateral de navegação |
| `Sign` | Componente de assinatura/logo |
| `Text` | Componente tipográfico |
| `TileButton` | Botão em formato tile |
| `VideoPlayer` | Player de vídeo (HLS) |

## Scripts

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run lint      # Lint
npm run preview   # Preview do build
```
