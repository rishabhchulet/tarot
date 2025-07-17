import { FlaskConical, Eye, PenTool, User, Sparkles, Shuffle } from 'lucide-react-native';

export interface ArchetypeData {
  id: string;
  name: string;
  icon: any;
  colors: string[];
  description: string;
  detailedDescription: string;
  strengths: string[];
  challenges: string[];
  guidance: string;
  keywords: string[];
}

export const DETAILED_ARCHETYPES: ArchetypeData[] = [
  {
    id: 'alchemist',
    name: 'The Alchemist',
    icon: FlaskConical,
    colors: ['#3b82f6', '#2563eb'],
    description: 'You walk the path of transformation and depth. Turning challenges into your power.',
    detailedDescription: 'You are a natural transformer, someone who sees potential in every situation—even the difficult ones. Where others see problems, you see raw materials for growth. Your journey is about turning lead into gold, both literally and metaphorically. You have an innate understanding that everything can be transformed with the right perspective, patience, and inner work.',
    strengths: [
      'Deep emotional intelligence and the ability to process complex feelings',
      'Natural resilience—you bounce back stronger from challenges',
      'Intuitive understanding of cycles, patterns, and transformational processes',
      'Ability to help others see their potential for growth and change',
      'Comfortable with depth and uncomfortable truths that lead to breakthrough'
    ],
    challenges: [
      'Can get stuck in transformation loops, always changing but never arriving',
      'May become impatient with others who resist change or growth',
      'Tendency to dive so deep into personal work that you neglect practical matters',
      'Sometimes attracts crisis or drama as fuel for transformation'
    ],
    guidance: 'Remember that transformation is not about constantly changing—it\'s about becoming more authentically yourself. Allow periods of integration between your growth spurts. Your power lies in your ability to transmute pain into wisdom, but don\'t forget to celebrate the gold you\'ve already created.',
    keywords: ['Transformation', 'Resilience', 'Growth', 'Depth', 'Breakthrough', 'Inner Work']
  },
  {
    id: 'seer',
    name: 'The Seer',
    icon: Eye,
    colors: ['#8b5cf6', '#7c3aed'],
    description: 'You navigate with intuition, relying on inner knowing to guide your decisions.',
    detailedDescription: 'You possess a natural gift for seeing beyond the surface of things. Your intuition is like a finely tuned instrument that picks up on subtle energies, hidden patterns, and future possibilities. You often "just know" things without being able to explain how. This inner sight is your superpower, allowing you to navigate life with a wisdom that goes beyond logic.',
    strengths: [
      'Highly developed intuition and psychic sensitivity',
      'Ability to read between the lines and sense hidden meanings',
      'Natural wisdom that others seek out for guidance and insight',
      'Strong connection to spiritual realms and mystical experiences',
      'Gift for seeing potential outcomes and making prophetic insights'
    ],
    challenges: [
      'Can struggle to trust your intuition in a logic-dominated world',
      'May absorb too much energy from others, leading to overwhelm',
      'Sometimes see so many possibilities that decision-making becomes difficult',
      'Others may not understand or believe your insights until they prove true'
    ],
    guidance: 'Trust the visions that come to you, even when they don\'t make logical sense. Your gift is rare and needed in this world. Create boundaries to protect your sensitive nature, and remember that your "knowing" is valid even without external proof. Use your sight to serve the highest good.',
    keywords: ['Intuition', 'Vision', 'Wisdom', 'Mystical', 'Insight', 'Inner Knowing']
  },
  {
    id: 'creator',
    name: 'The Creator',
    icon: PenTool,
    colors: ['#10b981', '#059669'],
    description: 'You are dedicated to creating something enduring, whether a home, a business, or art.',
    detailedDescription: 'You have an irrepressible urge to bring something new into the world. Whether it\'s art, a business, a beautiful home, or even a way of being, you are driven by the need to create. You see possibility everywhere and have the persistence to turn ideas into reality. Your creations are extensions of your soul.',
    strengths: [
      'Visionary thinking combined with practical execution skills',
      'Natural ability to see potential and bring ideas to life',
      'Persistence and dedication to see projects through to completion',
      'Inspiring others through your creative works and passionate energy',
      'Ability to innovate and find unique solutions to problems'
    ],
    challenges: [
      'Can become overwhelmed by too many creative ideas and projects',
      'May struggle with perfectionism that prevents completion',
      'Sometimes prioritize creation over self-care or relationships',
      'Can be devastated by criticism or failure of creative projects'
    ],
    guidance: 'Your creative energy is a sacred force that flows through you. Honor it by creating consistently, even in small ways. Not every creation needs to be a masterpiece—sometimes the joy is in the process itself. Remember to nurture yourself as lovingly as you nurture your creations.',
    keywords: ['Innovation', 'Vision', 'Persistence', 'Artistry', 'Manifestation', 'Legacy']
  },
  {
    id: 'mirror',
    name: 'The Mirror',
    icon: User,
    colors: ['#ef4444', '#dc2626'],
    description: 'You have a gift for sensing the emotions and energies of those around you.',
    detailedDescription: 'You are an emotional mirror, naturally reflecting back what others need to see about themselves. Your empathy is so strong that you can feel what others feel, sometimes even before they recognize it themselves. You have a gift for helping people understand their own hearts and minds through your presence and reflection.',
    strengths: [
      'Extraordinary empathy and emotional intelligence',
      'Natural ability to help others process and understand their feelings',
      'Skilled at reading body language, energy, and unspoken communication',
      'Talent for creating safe spaces where people can be vulnerable',
      'Intuitive understanding of human psychology and behavior patterns'
    ],
    challenges: [
      'Can lose yourself in others\' emotions and needs',
      'May struggle to identify your own feelings versus absorbed emotions',
      'Tendency to put others\' needs before your own consistently',
      'Can become exhausted from constantly taking on others\' emotional burdens'
    ],
    guidance: 'Your sensitivity is a gift, but you must learn to use it with boundaries. Like a mirror, you can reflect without absorbing. Practice distinguishing between your emotions and others\'. Remember that helping others see themselves clearly is different from carrying their emotional load.',
    keywords: ['Empathy', 'Reflection', 'Sensitivity', 'Healing', 'Understanding', 'Compassion']
  },
  {
    id: 'trickster',
    name: 'The Trickster',
    icon: Sparkles,
    colors: ['#f59e0b', '#d97706'],
    description: 'You challenge norms with humor and adaptability, pushing others to grow.',
    detailedDescription: 'You are the sacred disruptor, the one who uses humor, wit, and unexpected wisdom to shake people out of their comfortable patterns. You have a gift for seeing the absurdity in rigid systems and the wisdom to know when rules need to be bent. Your playful nature hides deep insight about human nature and social dynamics.',
    strengths: [
      'Quick wit and ability to find humor in almost any situation',
      'Natural talent for thinking outside the box and finding creative solutions',
      'Skill at helping others question limiting beliefs and assumptions',
      'Adaptability and resilience in changing circumstances',
      'Gift for teaching profound lessons through stories, jokes, and play'
    ],
    challenges: [
      'Others may not always understand your deeper wisdom behind the humor',
      'Can use humor to avoid dealing with serious emotions or issues',
      'May struggle with authority or traditional structures',
      'Sometimes your disruption causes more chaos than intended growth'
    ],
    guidance: 'Your humor and playfulness are medicine for a world that takes itself too seriously. Use your gifts to heal, not to harm. Remember that behind every great joke is a kernel of truth that can set people free from their own limitations. Your laughter is a form of love.',
    keywords: ['Humor', 'Wisdom', 'Adaptability', 'Disruption', 'Playfulness', 'Freedom']
  },
  {
    id: 'shapeshifter',
    name: 'The Shapeshifter',
    icon: Shuffle,
    colors: ['#6366f1', '#4f46e5'],
    description: 'You move between roles, but may wonder: "Which form is truly me?"',
    detailedDescription: 'You are fluid by nature, able to adapt and transform to meet the needs of any situation. Your ability to shift between different aspects of yourself is remarkable, but it can also leave you wondering which version is the "real" you. Your journey is about integrating all your shapes into one authentic, multifaceted self.',
    strengths: [
      'Exceptional adaptability and ability to thrive in various environments',
      'Natural talent for understanding different perspectives and cultures',
      'Skill at being exactly what others need in any given moment',
      'Rich inner life with access to many different aspects of personality',
      'Ability to reinvent yourself and start fresh when needed'
    ],
    challenges: [
      'Can struggle with identity and knowing your authentic self',
      'May feel like you\'re living multiple lives without integration',
      'Others might see you as inconsistent or hard to pin down',
      'Can lose touch with your core values while adapting to others'
    ],
    guidance: 'All your shapes are real—they are different facets of your beautiful, complex self. Your challenge is not to choose one identity but to find the thread that connects them all. Your adaptability is a superpower when guided by clear values and self-awareness.',
    keywords: ['Adaptability', 'Fluidity', 'Transformation', 'Versatility', 'Integration', 'Authenticity']
  }
];

// Helper function to get archetype info by name or id
export const getArchetypeInfo = (archetypeNameOrId?: string) => {
  if (!archetypeNameOrId) return null;
  
  // Find archetype by name or id (case insensitive)
  const archetype = DETAILED_ARCHETYPES.find(a => 
    a.id.toLowerCase() === archetypeNameOrId.toLowerCase() ||
    a.name.toLowerCase() === archetypeNameOrId.toLowerCase() ||
    a.name.toLowerCase().replace('the ', '') === archetypeNameOrId.toLowerCase()
  );
  
  if (!archetype) return null;
  
  return {
    icon: archetype.icon === FlaskConical ? '🧪' : 
          archetype.icon === Eye ? '👁️' : 
          archetype.icon === PenTool ? '✍️' : 
          archetype.icon === User ? '👤' : 
          archetype.icon === Sparkles ? '✨' : 
          archetype.icon === Shuffle ? '🔀' : '✨',
    color: archetype.colors[0],
    element: getArchetypeElement(archetype.id),
    name: archetype.name,
    description: archetype.description,
    keywords: archetype.keywords
  };
};

// Helper function to get archetype element
const getArchetypeElement = (archetypeId: string): string => {
  switch (archetypeId) {
    case 'alchemist':
      return 'Water';
    case 'seer':
      return 'Air';
    case 'creator':
      return 'Fire';
    case 'sage':
      return 'Earth';
    case 'mystic':
      return 'Spirit';
    case 'wanderer':
      return 'Air';
    default:
      return 'Spirit';
  }
}; 