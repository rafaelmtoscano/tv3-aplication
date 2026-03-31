// TODO: substituir por chamada à API quando disponível
export interface Poll {
  id: string;
  question: string;
  bill: string; // ex: "PL 1/2025"
  billDescription?: string;
  options: { id: string; label: string }[];
}

export const activePoll: Poll = {
  id: 'poll-demo-001',
  question: 'Qual sua opinião sobre?',
  bill: 'PL 1/2025',
  billDescription:
    'Encaminha o anteprojeto de lei de criação de oito varas federais na Seção Judiciária de Santa Catarina, do Tribunal Regional Federal da 4ª Região, sem aumento de gastos com pessoal e encargos sociais.',
  options: [
    { id: 'concordo', label: 'Concordo' },
    { id: 'discordo', label: 'Discordo' },
  ],
};
