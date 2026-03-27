// TODO: substituir por chamada à API quando disponível
export interface Poll {
  id: string;
  question: string;
  bill: string; // ex: "PL 1234/2024"
  options: { id: string; label: string }[];
}

export const activePoll: Poll = {
  id: 'poll-demo-001',
  question: 'Qual sua opinião sobre?',
  bill: 'PL 1234/2024',
  options: [
    { id: 'sim',       label: 'Sim'       },
    { id: 'nao',       label: 'Não'       },
    { id: 'abstencao', label: 'Abstenção' },
  ],
};
