export interface BookItem {
  id: 'rules' | 'school' | 'snail';
  title: string;
  subtitle: string;
  description: string;
  coverSrc: string;
  editionNote: string;
  audience: string;
  price: number;
  purchaseUrl?: string;
  ctaLabel: string;
}

export const BOOKS: BookItem[] = [
  {
    id: 'rules',
    title: 'The Rules',
    subtitle: 'Red & Gold Hardcover / Paperback',
    description: 'Lessons for Success in the Theatre and Beyond',
    coverSrc: '/assets/extracted/book-the-rules.png',
    editionNote:
      'Five field-tested rehearsal room principles for actors, directors, crews, and creative teams.',
    audience: 'Performers, directors & creative collaborators',
    price: 22,
    ctaLabel: 'Buy Now',
  },
  {
    id: 'school',
    title: 'The Rules: School Edition',
    subtitle: 'Navy & Gold Classroom Handbook',
    description: 'The same five rules, written for young performers',
    coverSrc: '/assets/extracted/book-school-edition.png',
    editionNote:
      'Adapted for drama teachers, student casts, backstage crews, and school productions.',
    audience: 'Drama teachers, student casts & youth ensembles',
    price: 18,
    ctaLabel: 'Buy Now',
  },
  {
    id: 'snail',
    title: 'The Snail and the Sloth',
    subtitle: 'Illustrated Children’s Picture Book',
    description: 'A story about friendship, patience, and celebrating each step of the journey.',
    coverSrc: '/assets/extracted/book-snail-sloth.png',
    editionNote:
      'A gentle bedtime story reminding young readers that moving at your own pace is its own kind of strength.',
    audience: 'Children, families & bedtime readers',
    price: 16,
    ctaLabel: 'Buy Now',
  },
];

export const AUTHOR_STATS = [
  { value: '8', label: 'Age she started acting' },
  { value: '10', label: 'Age she wrote her first play' },
  { value: '15', label: 'Years directing' },
  { value: '3', label: 'Years of theatre training' },
];

export const THEATRE_RULES = [
  'Any day on the stage is a good day.',
  'Whatever you practice, you get good at.',
  'If it’s not your prop, don’t touch it.',
  'If you don’t have the show on Monday, you can’t have it on Friday.',
  'Assume your show is special, and everything else is a pleasant surprise.',
];

export const SCHOOL_HIGHLIGHTS = [
  {
    title: 'Classroom-ready language',
    body: 'Five practical principles students can bring into every rehearsal.',
  },
  {
    title: 'Built for casts and crews',
    body: 'Use it in rehearsals, productions and classroom discussions.',
  },
  {
    title: 'The five rules, made practical',
    body: 'A shared vocabulary for everyone working on the show.',
  },
];
