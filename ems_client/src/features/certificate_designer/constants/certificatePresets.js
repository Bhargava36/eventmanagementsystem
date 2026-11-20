// Certificate Presets, Dynamic Tags & Font Definitions

export const CERTIFICATE_DYNAMIC_TAGS = [
  { tag: '{{recipient_name}}', label: 'Recipient Name', sample: 'Rahul Sharma', category: 'Participant' },
  { tag: '{{role}}', label: 'Role in Team', sample: 'Team Lead', category: 'Participant' },
  { tag: '{{team_name}}', label: 'Team Name', sample: 'CyberSentinels', category: 'Team' },
  { tag: '{{college_name}}', label: 'College / Institute', sample: 'AITAM College, Tekkali', category: 'Team' },
  { tag: '{{team_and_role}}', label: 'Team & Role Combined', sample: 'of Team CyberSentinels (Team Lead)', category: 'Team' },
  { tag: '{{event_name}}', label: 'Event / Hackathon Name', sample: 'Avishkaar 4', category: 'Event' },
  { tag: '{{track}}', label: 'Track Mode', sample: 'Virtual', category: 'Event' },
  { tag: '{{event_date}}', label: 'Event Date(s)', sample: 'Nov 25 - 26, 2026', category: 'Event' },
  { tag: '{{venue_location}}', label: 'Venue Location', sample: 'AITAM College, Tekkali', category: 'Event' },
  { tag: '{{certificate_id}}', label: 'Serial Certificate ID', sample: 'CERT-VIRT-22-32-1', category: 'Verification' },
  { tag: '{{issue_date}}', label: 'Issue Date', sample: 'November 19, 2026', category: 'Verification' },
  { tag: '{{citation}}', label: 'Full Citation Paragraph', sample: 'for exemplary participation and successful jury evaluation in Avishkaar 4 (Virtual Hackathon Track)...', category: 'Citation' },
  { tag: '{{signatory_1_name}}', label: 'Signatory 1 Name', sample: 'Dr. Ch. Ramesh', category: 'Signatories' },
  { tag: '{{signatory_1_title}}', label: 'Signatory 1 Title', sample: 'Convener & HOD, CSE', category: 'Signatories' },
  { tag: '{{signatory_2_name}}', label: 'Signatory 2 Name', sample: 'Dr. A.S. Srinivasa Rao', category: 'Signatories' },
  { tag: '{{signatory_2_title}}', label: 'Signatory 2 Title', sample: 'Principal, AITAM', category: 'Signatories' }
];

export const CERTIFICATE_FONTS = [
  { name: 'Cinzel Decorative', family: "'Cinzel Decorative', serif", category: 'Serif / Ornate' },
  { name: 'Playfair Display', family: "'Playfair Display', serif", category: 'Serif / Luxury' },
  { name: 'Georgia', family: 'Georgia, serif', category: 'Classic Serif' },
  { name: 'Inter', family: "'Inter', sans-serif", category: 'Clean Sans' },
  { name: 'Montserrat', family: "'Montserrat', sans-serif", category: 'Modern Geometric' },
  { name: 'Plus Jakarta Sans', family: "'Plus Jakarta Sans', sans-serif", category: 'Clean UI' },
  { name: 'Great Vibes', family: "'Great Vibes', cursive", category: 'Formal Script' },
  { name: 'Alex Brush', family: "'Alex Brush', cursive", category: 'Elegant Script' },
  { name: 'Courier Prime', family: "'Courier Prime', monospace", category: 'Monospace Serial' }
];

export const CERTIFICATE_PRESETS = [
  {
    id: 'aitam_prestige',
    name: 'AITAM Prestige (Gold & Dark)',
    description: 'Official luxury dark background with polished gold ornate borders and seals',
    bgColor: '#030712',
    accentColor: '#d4af37',
    textColor: '#ffffff',
    subTextColor: '#94a3b8',
    borderColor: '#d4af37'
  },
  {
    id: 'ivory_academic',
    name: 'Ivory Academic Classic',
    description: 'Traditional academic parchment certificate with deep navy borders and gold accents',
    bgColor: '#fcfbf7',
    accentColor: '#0f172a',
    textColor: '#0f172a',
    subTextColor: '#475569',
    borderColor: '#c5a059'
  },
  {
    id: 'emerald_innovation',
    name: 'Emerald Innovation (Tech Luxe)',
    description: 'High-tech hackathon look with deep emerald tints and holographic teal accents',
    bgColor: '#021814',
    accentColor: '#10b981',
    textColor: '#ffffff',
    subTextColor: '#6ee7b7',
    borderColor: '#10b981'
  },
  {
    id: 'minimalist_clean',
    name: 'Minimalist Clean White',
    description: 'Ultra-crisp modern design with minimalist borders and high-legibility typography',
    bgColor: '#ffffff',
    accentColor: '#0284c7',
    textColor: '#0f172a',
    subTextColor: '#64748b',
    borderColor: '#e2e8f0'
  }
];

export const SAMPLE_TEAM_MEMBERS = [
  {
    index: 1,
    name: 'Lakshmi Sai Saketh Bikkina',
    role: 'Team Lead',
    college: 'AITAM College, Tekkali',
    certId: 'CERT-VIRT-22-32-1'
  },
  {
    index: 2,
    name: 'Priya Dharshini Patel',
    role: 'Full-Stack Developer',
    college: 'AITAM College, Tekkali',
    certId: 'CERT-VIRT-22-32-2'
  },
  {
    index: 3,
    name: 'Kiran Kumar Varma',
    role: 'ML Engineer',
    college: 'AITAM College, Tekkali',
    certId: 'CERT-VIRT-22-32-3'
  },
  {
    index: 4,
    name: 'Ananya Sree Reddy',
    role: 'UI/UX & Cloud Lead',
    college: 'AITAM College, Tekkali',
    certId: 'CERT-VIRT-22-32-4'
  }
];

