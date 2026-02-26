import { typography } from '../styles/typography';
import { colors } from '../styles/colors';

export default function Home() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.background.baseInverse,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1 style={{ ...typography.display.large, color: colors.text.primaryInverse }}>
        Home
      </h1>
    </div>
  );
}
