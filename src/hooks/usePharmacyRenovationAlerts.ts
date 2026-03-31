// Calcula alertas de renovação a partir do histórico HÓRUS.
// Lógica derivada — não é campo de API. Regra: daysLeft = quantidade - diasDesdeRetirada.
// daysLeft <= 5: urgente (vermelho). <= 10: atenção (amarelo). > 10: ok (verde).

import { useMemo } from 'react';
import type { Dispensacao } from '../context/AuthContext';

export interface RenovationAlert {
  dispensacao: Dispensacao;
  daysLeft: number;
  urgency: 'ok' | 'warn' | 'urgent';
}

export function usePharmacyRenovationAlerts(dispensacoes: Dispensacao[]): RenovationAlert[] {
  return useMemo(() => {
    const today = new Date();

    return dispensacoes
      .map((dispensacao) => {
        const retirada = new Date(dispensacao.dataRetirada);
        const diasPassados = Math.floor((today.getTime() - retirada.getTime()) / (1000 * 60 * 60 * 24));
        const daysLeft = dispensacao.quantidade - diasPassados;
        const urgency: RenovationAlert['urgency'] = daysLeft <= 5 ? 'urgent' : daysLeft <= 10 ? 'warn' : 'ok';

        return { dispensacao, daysLeft, urgency };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [dispensacoes]);
}
