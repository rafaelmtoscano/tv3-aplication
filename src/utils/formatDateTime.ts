/**
 * Formats an ISO 8601 date string to a relative time string in Portuguese
 * Examples: "Agora mesmo", "Há 2 horas", "Há 3 dias"
 */
export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return '';

  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return 'No futuro';
    if (diffMs < 60000) return 'Agora mesmo';
    if (diffMs < 3600000) {
      const mins = Math.floor(diffMs / 60000);
      return `Há ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
    }
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `Há ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    if (diffMs < 604800000) {
      const days = Math.floor(diffMs / 86400000);
      return `Há ${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
    const weeks = Math.floor(diffMs / 604800000);
    return `Há ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  } catch {
    return '';
  }
}
