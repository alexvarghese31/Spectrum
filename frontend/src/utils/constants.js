// A list of common English "stopwords" to filter out from keyword analysis.
export const STOPWORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd',
  'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn',
  'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn',
  'weren', 'won', 'wouldn', '●'
]);

// A list of strong, impactful action verbs.
export const ACTION_VERBS = [
  'accelerated', 'achieved', 'acquired', 'adapted', 'administered', 'advanced', 'advised',
  'advocated', 'allocated', 'analyzed', 'approved', 'architected', 'arranged', 'assembled',
  'assessed', 'attained', 'audited', 'authored', 'automated', 'balanced', 'boosted',
  'budgeted', 'built', 'calculated', 'centralized', 'chaired', 'championed', 'clarified',
  'collaborated', 'conceived', 'conceptualized', 'condensed', 'configured', 'consolidated',
  'constructed', 'consulted', 'contracted', 'controlled', 'converted', 'coordinated',
  'corrected', 'counseled', 'created', 'cultivated', 'debugged', 'decreased', 'defined',
  'delegated', 'delivered', 'demonstrated', 'designed', 'detected', 'developed', 'devised',
  'diagnosed', 'directed', 'discovered', 'documented', 'doubled', 'drove', 'edited',
  'educated', 'eliminated', 'enabled', 'encouraged', 'engineered', 'enhanced', 'enlarged',
  'ensured', 'established', 'estimated', 'evaluated', 'examined', 'exceeded', 'executed',
  'expanded', 'expedited', 'explained', 'explored', 'facilitated', 'finalized', 'financed',
  'focused', 'forecasted', 'formed', 'formulated', 'fostered', 'founded', 'generated',
  'governed', 'guided', 'halved', 'headed', 'identified', 'illustrated', 'implemented',
  'improved', 'increased', 'indexed', 'influenced', 'initiated', 'innovated', 'inspected',
  'inspired', 'installed', 'instituted', 'instructed', 'integrated', 'interpreted',
  'interviewed', 'introduced', 'invented', 'investigated', 'launched', 'led', 'lectured',
  'licensed', 'lobbied', 'maintained', 'managed', 'marketed', 'mastered', 'maximized',
  'mediated', 'mentored', 'merged', 'migrated', 'minimized', 'modeled', 'moderated',
  'modernized', 'monitored', 'motivated', 'navigated', 'negotiated', 'operated',
  'optimized', 'orchestrated', 'organized', 'overhauled', 'oversaw', 'partnered',
  'perfected', 'performed', 'pioneered', 'planned', 'predicted', 'prepared', 'presented',
  'presided', 'prioritized', 'produced', 'programmed', 'projected', 'promoted',
  'proposed', 'proved', 'provided', 'published', 'quantified', 'raised', 'ranked',
  'rated', 'rebuilt', 'received', 'recommended', 'reconciled', 'recruited', 'redesigned',
  'reduced', 'refined', 'regulated', 'rehabilitated', 'remodeled', 'reorganized',
  'repaired', 'replaced', 'reported', 'researched', 'resolved', 'restored', 'restructured',
  'retrieved', 'revamped', 'reversed', 'reviewed', 'revised', 'saved', 'scheduled',
  'secured', 'selected', 'served', 'simplified', 'slashed', 'sold', 'solved', 'spearheaded',
  'specified', 'staffed', 'standardized', 'steered', 'streamlined', 'strengthened',
  'structured', 'studied', 'succeeded', 'summarized', 'supervised', 'supplied',
  'supported', 'surpassed', 'surveyed', 'synthesized', 'systematized', 'tabulated',
  'taught', 'tested', 'trained', 'transferred', 'transformed', 'translated', 'tripled',
  'troubleshot', 'unified', 'united', 'unraveled', 'updated', 'upgraded', 'utilized',
  'validated', 'verbalized', 'verified', 'visualized', 'won', 'wrote'
];

// A list of common resume clichés and buzzwords to avoid.
export const BUZZWORDS = [
  'go-getter', 'synergy', 'rockstar', 'ninja', 'guru', 'thought leader',
  'results-driven', 'team player', 'hard worker', 'self-motivated', 'detail-oriented',
  'proactive', 'go-to person', 'strategic thinker', 'dynamic', 'out-of-the-box',
  'problem solver', 'thinking outside the box'
];

// NEW: A thesaurus for common action verbs to suggest alternatives.
export const ACTION_VERB_SYNONYMS = {
  led: ['orchestrated', 'spearheaded', 'chaired', 'coordinated', 'executed', 'supervised'],
  managed: ['directed', 'oversaw', 'governed', 'guided', 'operated', 'conducted'],
  developed: ['architected', 'built', 'created', 'designed', 'engineered', 'formulated', 'programmed'],
  created: ['produced', 'founded', 'generated', 'initiated', 'launched', 'pioneered'],
  improved: ['enhanced', 'optimized', 'overhauled', 'refined', 'revamped', 'streamlined', 'upgraded'],
  researched: ['analyzed', 'evaluated', 'examined', 'investigated', 'explored', 'quantified'],
  achieved: ['attained', 'completed', 'delivered', 'accomplished', 'secured', 'surpassed'],
  implemented: ['applied', 'deployed', 'enforced', 'executed', 'integrated', 'installed'],
};
