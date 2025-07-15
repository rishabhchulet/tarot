export interface ArchetypeInfo {
  name: string;
  icon: string;
  color: string;
  description: string;
  element: string;
}

export const ARCHETYPE_MAPPING: { [key: string]: ArchetypeInfo } = {
  // Major Arcana Archetypes
  'The Fool': {
    name: 'The Fool',
    icon: '🔮',
    color: '#fbbf24',
    description: 'New beginnings and adventure',
    element: 'Air'
  },
  'The Magician': {
    name: 'The Magician',
    icon: '⚡',
    color: '#a855f7',
    description: 'Manifestation and willpower',
    element: 'Fire'
  },
  'The High Priestess': {
    name: 'The High Priestess',
    icon: '🌙',
    color: '#3b82f6',
    description: 'Intuition and inner wisdom',
    element: 'Water'
  },
  'The Empress': {
    name: 'The Empress',
    icon: '🌸',
    color: '#10b981',
    description: 'Creativity and abundance',
    element: 'Earth'
  },
  'The Emperor': {
    name: 'The Emperor',
    icon: '👑',
    color: '#dc2626',
    description: 'Authority and structure',
    element: 'Fire'
  },
  'The Hierophant': {
    name: 'The Hierophant',
    icon: '📿',
    color: '#7c3aed',
    description: 'Spiritual guidance and tradition',
    element: 'Earth'
  },
  'The Lovers': {
    name: 'The Lovers',
    icon: '💕',
    color: '#ec4899',
    description: 'Love and relationships',
    element: 'Air'
  },
  'The Chariot': {
    name: 'The Chariot',
    icon: '🏆',
    color: '#f59e0b',
    description: 'Determination and victory',
    element: 'Water'
  },
  'Strength': {
    name: 'Strength',
    icon: '🦁',
    color: '#ef4444',
    description: 'Inner strength and courage',
    element: 'Fire'
  },
  'The Hermit': {
    name: 'The Hermit',
    icon: '🕯️',
    color: '#64748b',
    description: 'Soul searching and guidance',
    element: 'Earth'
  },
  'Wheel of Fortune': {
    name: 'Wheel of Fortune',
    icon: '🎯',
    color: '#7c3aed',
    description: 'Good luck and cycles',
    element: 'Fire'
  },
  'Justice': {
    name: 'Justice',
    icon: '⚖️',
    color: '#0891b2',
    description: 'Justice and fairness',
    element: 'Air'
  },
  'The Hanged Man': {
    name: 'The Hanged Man',
    icon: '🔄',
    color: '#06b6d4',
    description: 'Surrender and perspective',
    element: 'Water'
  },
  'Death': {
    name: 'Death',
    icon: '🦋',
    color: '#6b7280',
    description: 'Transformation and endings',
    element: 'Water'
  },
  'Temperance': {
    name: 'Temperance',
    icon: '🌊',
    color: '#0ea5e9',
    description: 'Balance and moderation',
    element: 'Fire'
  },
  'The Devil': {
    name: 'The Devil',
    icon: '🔗',
    color: '#991b1b',
    description: 'Bondage and materialism',
    element: 'Earth'
  },
  'The Tower': {
    name: 'The Tower',
    icon: '⚡',
    color: '#dc2626',
    description: 'Sudden change and revelation',
    element: 'Fire'
  },
  'The Star': {
    name: 'The Star',
    icon: '⭐',
    color: '#3b82f6',
    description: 'Hope and spiritual guidance',
    element: 'Air'
  },
  'The Moon': {
    name: 'The Moon',
    icon: '🌙',
    color: '#8b5cf6',
    description: 'Illusion and subconscious',
    element: 'Water'
  },
  'The Sun': {
    name: 'The Sun',
    icon: '☀️',
    color: '#f59e0b',
    description: 'Joy and success',
    element: 'Fire'
  },
  'Judgement': {
    name: 'Judgement',
    icon: '🎺',
    color: '#7c3aed',
    description: 'Rebirth and inner calling',
    element: 'Fire'
  },
  'The World': {
    name: 'The World',
    icon: '🌍',
    color: '#059669',
    description: 'Completion and accomplishment',
    element: 'Earth'
  },
  
  // Suit-based Archetypes
  'Wands': {
    name: 'Wands',
    icon: '🔥',
    color: '#ef4444',
    description: 'Fire element - passion and creativity',
    element: 'Fire'
  },
  'Cups': {
    name: 'Cups',
    icon: '💧',
    color: '#3b82f6',
    description: 'Water element - emotions and intuition',
    element: 'Water'
  },
  'Swords': {
    name: 'Swords',
    icon: '💨',
    color: '#8b5cf6',
    description: 'Air element - thoughts and communication',
    element: 'Air'
  },
  'Pentacles': {
    name: 'Pentacles',
    icon: '🌱',
    color: '#059669',
    description: 'Earth element - material and practical',
    element: 'Earth'
  }
};

export const getArchetypeInfo = (archetypeName?: string): ArchetypeInfo | null => {
  if (!archetypeName) return null;
  
  // Try exact match first
  if (ARCHETYPE_MAPPING[archetypeName]) {
    return ARCHETYPE_MAPPING[archetypeName];
  }
  
  // Try to find partial match for suit-based archetypes
  const suitMatches = ['Wands', 'Cups', 'Swords', 'Pentacles'];
  for (const suit of suitMatches) {
    if (archetypeName.includes(suit)) {
      return ARCHETYPE_MAPPING[suit];
    }
  }
  
  // Default fallback
  return {
    name: archetypeName,
    icon: '✨',
    color: '#fbbf24',
    description: 'Your unique spiritual archetype',
    element: 'Spirit'
  };
}; 