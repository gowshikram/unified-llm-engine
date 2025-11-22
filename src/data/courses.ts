export interface Exercise {
  id: string;
  name: string;
  description: string;
  type: 'interactive' | 'worksheet' | 'game';
}

export interface Resource {
  title: string;
  url: string;
  type: 'pdf' | 'video' | 'website' | 'manual';
  platform?: string;
  description?: string;
}

export interface Course {
  id: string;
  title: string;
  shortTitle: string;
  icon: string;
  color: string;
  duration: string;
  level: string;
  description: string;
  fullDescription: string;
  objectives: string[];
  exercises: Exercise[];
  resources: Resource[];
  videos: Resource[];
  manuals: Resource[];
}

export const courses: Course[] = [
  {
    id: 'right-brain-dev',
    title: 'Right Brain Development',
    shortTitle: 'Right Brain',
    icon: '🦁',
    color: 'from-orange-400 to-orange-600',
    duration: '35 Days',
    level: 'Intensive',
    description: 'Unlock your child\'s visual memory and creative thinking abilities through proven right-brain training techniques.',
    fullDescription: '35-day intensive program designed to develop photographic memory, speed reading, and enhanced visualization skills through scientifically-proven right-brain activation techniques.',
    objectives: [
      'Develop photographic memory capabilities',
      'Enhance visual-spatial intelligence',
      'Improve concentration and focus',
      'Activate intuitive learning abilities',
      'Build rapid information processing skills'
    ],
    exercises: [
      { id: 'mandala', name: 'Mandala Memory', description: 'Visual pattern recognition and recall training', type: 'interactive' },
      { id: 'flashcards', name: 'High Speed Flashcards', description: 'Rapid image recognition at 0.5-second intervals', type: 'interactive' },
      { id: 'tangram', name: 'Tangram Puzzle', description: 'Spatial reasoning and geometric visualization', type: 'game' },
      { id: 'eye-tracking', name: 'Eye Tracking', description: 'Visual coordination and tracking exercises', type: 'interactive' },
      { id: 'alpha-music', name: 'Alpha Music', description: 'Brain wave synchronization for optimal learning', type: 'interactive' },
      { id: 'speed-reaction', name: 'Speed Reaction', description: 'Enhance reflexes and decision-making speed', type: 'game' },
      { id: 'memory-training', name: 'Memory Training', description: 'Sequential and pattern-based memory exercises', type: 'interactive' },
      { id: 'flappy-bird', name: 'Flappy Bird', description: 'Focus and hand-eye coordination game', type: 'game' },
      { id: 'pattern-match', name: 'Pattern Match', description: 'Visual pattern recognition challenge', type: 'game' },
      { id: 'visual-memory', name: 'Visual Memory', description: 'Image sequence memorization', type: 'interactive' },
      { id: 'math-speed', name: 'Math Speed', description: 'Mental calculation under time pressure', type: 'game' },
      { id: 'word-recall', name: 'Word Recall', description: 'Rapid vocabulary memorization', type: 'interactive' }
    ],
    resources: [
      {
        title: 'Right Brain Education Library',
        url: 'https://www.rightbraineducationlibrary.com',
        type: 'website',
        description: 'Complete course portal with sample programs and daily plans'
      },
      {
        title: 'Think Right Centre',
        url: 'https://thinkright.co.in',
        type: 'website',
        description: 'Live workshops and course listings'
      },
      {
        title: 'Right Brain Baby',
        url: 'https://www.rightbrainbaby.com',
        type: 'website',
        description: 'Daily activities and flashcard demonstrations'
      }
    ],
    videos: [
      {
        title: 'Daily Right-Brain Activities & Flashcards',
        url: 'https://www.rightbrainbaby.com',
        type: 'video',
        description: 'Video tutorials and activity demonstrations'
      },
      {
        title: 'Sample Activity Breakdowns',
        url: 'https://www.shichida.com.au/blog/right-brain-development-activities-for-babies/',
        type: 'video',
        description: 'Detailed instructions for parents and teachers'
      }
    ],
    manuals: [
      {
        title: 'Right Brain Training Guide',
        url: 'https://www.scribd.com/document/613152275/Right-Brain-Education-Manual',
        type: 'pdf',
        platform: 'Scribd',
        description: 'Comprehensive training manual with full methodology'
      }
    ]
  },
  {
    id: 'handwriting',
    title: 'Handwriting Mastery',
    shortTitle: 'Handwriting',
    icon: '✍️',
    color: 'from-blue-400 to-blue-600',
    duration: '8 Weeks',
    level: 'Beginner to Advanced',
    description: 'Master beautiful, legible handwriting through visual patterns and right-brain techniques.',
    fullDescription: 'Transform handwriting skills using proven right-brain methods focusing on visual patterns, muscle memory, and spatial awareness for improved form, speed, and legibility.',
    objectives: [
      'Develop proper letter formation techniques',
      'Improve writing speed and fluidity',
      'Enhance hand-eye coordination',
      'Build muscle memory for consistent writing',
      'Create personal handwriting style'
    ],
    exercises: [
      { id: 'letter-tracing', name: 'Letter Tracing Game', description: 'Interactive letter formation practice', type: 'interactive' },
      { id: 'shape-recognition', name: 'Shape Recognition', description: 'Visual shape identification and drawing', type: 'game' },
      { id: 'pattern-writing', name: 'Pattern Writing', description: 'Fluid pattern practice for motor control', type: 'worksheet' }
    ],
    resources: [
      {
        title: 'Right Brain Writing Techniques',
        url: 'https://diannecraft.org/right-brain-writing/',
        type: 'website',
        description: 'Complete methodology with video and article guide'
      },
      {
        title: 'Free Printable Tracing Worksheets',
        url: 'https://www.youtube.com/watch?v=X6aGqcmnztU',
        type: 'pdf',
        description: 'Downloadable practice sheets (link in video description)'
      }
    ],
    videos: [
      {
        title: 'Comprehensive Handwriting Improvement Course',
        url: 'https://www.skillshare.com/en/classes/improve-your-handwriting-strategies-for-better-form-legibility-and-speed/1332239399',
        type: 'video',
        platform: 'Skillshare',
        description: 'Complete course on form, legibility, and speed'
      },
      {
        title: 'Practical Handwriting Exercises Walkthrough',
        url: 'https://www.youtube.com/watch?v=X6aGqcmnztU',
        type: 'video',
        description: 'Step-by-step tutorial with downloadable worksheets'
      }
    ],
    manuals: [
      {
        title: 'Mastering Handwriting',
        url: 'https://www.scribd.com/document/363735196/Mastering-Handwriting',
        type: 'pdf',
        platform: 'Scribd',
        description: 'Complete handwriting improvement manual'
      }
    ]
  },
  {
    id: 'phonics',
    title: 'Phonics & Reading',
    shortTitle: 'Phonics',
    icon: '📖',
    color: 'from-green-400 to-green-600',
    duration: '12 Weeks',
    level: 'Beginner',
    description: 'Build strong reading foundations through visual phonics and multi-sensory learning.',
    fullDescription: 'Comprehensive phonics program using visual cues, hand signs, and multi-sensory techniques to develop strong reading and pronunciation skills in young learners.',
    objectives: [
      'Master all phonetic sounds and combinations',
      'Develop sound-letter recognition',
      'Build word decoding skills',
      'Enhance reading fluency',
      'Strengthen spelling abilities'
    ],
    exercises: [
      { id: 'sound-matching', name: 'Sound Matching', description: 'Match sounds to letters and images', type: 'interactive' },
      { id: 'letter-sound', name: 'Letter-Sound Game', description: 'Interactive phonics practice', type: 'game' },
      { id: 'word-building', name: 'Word Building', description: 'Construct words from phonetic components', type: 'interactive' }
    ],
    resources: [
      {
        title: 'Kiz Phonics Visual Phonics Workbooks',
        url: 'https://www.kizphonics.com/materials/',
        type: 'website',
        description: 'Complete materials with PDFs, games, and activities'
      }
    ],
    videos: [
      {
        title: 'Introduction to Visual Phonics Method',
        url: 'https://www.youtube.com/watch?v=Zujjrn8Fg0A',
        type: 'video',
        description: 'Demonstration and explanation of visual phonics'
      },
      {
        title: 'Jolly Phonics Official Lesson Webinar',
        url: 'https://www.youtube.com/watch?v=TIb-eWOyMts',
        type: 'video',
        description: 'Official training webinar'
      },
      {
        title: 'Free Phonics Workshop for Teachers/Parents',
        url: 'https://www.youtube.com/watch?v=W8IyJOBPlhA',
        type: 'video',
        description: 'Comprehensive workshop for educators'
      }
    ],
    manuals: []
  },
  {
    id: 'visual-math',
    title: 'Visual Math',
    shortTitle: 'Math',
    icon: '🧮',
    color: 'from-purple-400 to-purple-600',
    duration: '10 Weeks',
    level: 'All Levels',
    description: 'Learn mathematics through visualization, patterns, and mental imagery.',
    fullDescription: 'Revolutionary approach to mathematics using visual patterns, mental imagery, and right-brain techniques to make math intuitive and enjoyable.',
    objectives: [
      'Develop mental calculation abilities',
      'Visualize mathematical concepts',
      'Recognize number patterns',
      'Build problem-solving confidence',
      'Master arithmetic through imagery'
    ],
    exercises: [
      { id: 'number-patterns', name: 'Number Patterns', description: 'Identify and complete numerical sequences', type: 'interactive' },
      { id: 'visual-counting', name: 'Visual Counting', description: 'Quantity recognition through imagery', type: 'game' },
      { id: 'math-speed-challenge', name: 'Math Speed Challenge', description: 'Rapid mental arithmetic practice', type: 'game' }
    ],
    resources: [
      {
        title: 'Visual Math Games and Lessons',
        url: 'https://www.rightbrainbaby.com',
        type: 'website',
        description: 'Interactive games and pattern-based lessons'
      },
      {
        title: 'BrainCells Math Program',
        url: 'https://course.braincells.in',
        type: 'website',
        description: 'Complete visualization modules'
      },
      {
        title: 'Tweedlewink Math Visualization',
        url: 'https://www.rightbrainkids.com',
        type: 'website',
        description: 'Structured math visualization program'
      }
    ],
    videos: [],
    manuals: []
  },
  {
    id: 'memory',
    title: 'Memory Training',
    shortTitle: 'Memory',
    icon: '🧠',
    color: 'from-pink-400 to-pink-600',
    duration: '6 Weeks',
    level: 'Intermediate',
    description: 'Develop photographic memory using advanced memory palace and association techniques.',
    fullDescription: 'Advanced memory training program teaching proven techniques like the memory palace, linking method, and visual association for exceptional recall abilities.',
    objectives: [
      'Build a functional memory palace',
      'Master the linking method',
      'Develop photographic memory skills',
      'Enhance long-term retention',
      'Learn speed memorization techniques'
    ],
    exercises: [
      { id: 'memory-palace', name: 'Memory Palace', description: 'Build and navigate mental memory spaces', type: 'interactive' },
      { id: 'visual-association', name: 'Visual Association', description: 'Link concepts through vivid imagery', type: 'interactive' },
      { id: 'sequence-memory', name: 'Sequence Memory', description: 'Remember complex sequences and lists', type: 'game' }
    ],
    resources: [],
    videos: [],
    manuals: [
      {
        title: 'Comprehensive Right-Brain/Memory Training Manual',
        url: 'https://www.scribd.com/document/613152275/Right-Brain-Education-Manual',
        type: 'pdf',
        platform: 'Scribd',
        description: 'Complete training manual with memory techniques'
      },
      {
        title: 'Visual Memory Lesson Breakdown',
        url: 'https://simplebooklet.com/rightbraineducationmanual',
        type: 'manual',
        description: 'Interactive lesson guide with detailed breakdowns'
      }
    ]
  },
  {
    id: 'art-creativity',
    title: 'Art & Creativity',
    shortTitle: 'Art',
    icon: '🎨',
    color: 'from-yellow-400 to-yellow-600',
    duration: '8 Weeks',
    level: 'All Levels',
    description: 'Unleash creative potential through right-brain drawing and artistic expression.',
    fullDescription: 'Artistic development program based on Betty Edwards\' "Drawing on the Right Side of the Brain" methodology, focusing on perception, creativity, and self-expression.',
    objectives: [
      'Develop drawing skills through right-brain techniques',
      'Enhance visual perception',
      'Boost creative confidence',
      'Master color theory and composition',
      'Express ideas through art'
    ],
    exercises: [
      { id: 'creative-drawing', name: 'Creative Drawing', description: 'Free-form artistic expression', type: 'interactive' },
      { id: 'color-harmony', name: 'Color Harmony', description: 'Color theory and palette creation', type: 'interactive' },
      { id: 'pattern-creation', name: 'Pattern Creation', description: 'Design and artistic patterns', type: 'game' }
    ],
    resources: [
      {
        title: 'Tweedlewink Art & Creativity Modules',
        url: 'https://www.rightbrainkids.com',
        type: 'website',
        description: 'Structured creative modules'
      }
    ],
    videos: [],
    manuals: [
      {
        title: 'The New Drawing on the Right Side of the Brain',
        url: 'https://dn790001.ca.archive.org/0/items/pdfy-5dQt81v7NYVZl2La/The%20New%20Drawing%20on%20the%20Right%20Side%20of%20the%20Brain.pdf',
        type: 'pdf',
        description: 'Complete book by Betty Edwards (full PDF)'
      }
    ]
  }
];
