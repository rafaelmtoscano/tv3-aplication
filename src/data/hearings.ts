// TODO: substituir por chamada à API quando disponível
export interface HearingComment {
  id: string;
  text: string;
  author: string;
  state: string;
  time: string;
}

export const activeHearing: { title: string; comments: HearingComment[] } = {
  title: 'Audiências públicas',
  comments: [
    { id: '1', text: 'Como ficam as Pessoas com deficiência nesse cenário?', author: 'P. Santos', state: 'PB', time: '12:30' },
    { id: '2', text: 'Como ficam as Pessoas com deficiência nesse cenário?', author: 'P. Santos', state: 'PB', time: '12:30' },
    { id: '3', text: 'Como ficam as Pessoas com deficiência nesse cenário?', author: 'P. Santos', state: 'PB', time: '12:30' },
  ],
};
