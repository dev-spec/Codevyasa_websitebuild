import type { TechnologyPage } from './types';

/**
 * Technology stack pages (mega-menu → /technology/[slug]). Labels + slugs match
 * the live "Our Technologies" menu exactly. Copy is written per-technology (no
 * lorem); spot-check against live /technology/<slug> pages (TODO_ASSETS §8).
 */
export const technologyPages: TechnologyPage[] = [
  // ---- Frontend ----
  {
    slug: 'html-css',
    name: 'HTML/CSS',
    category: 'Frontend',
    summary: 'Semantic, accessible, standards-first markup and styling that performs everywhere.',
    overview: [
      'HTML and CSS are the bedrock of every interface we ship. We write semantic, accessible markup and modern, resilient CSS that renders fast and looks right on every device.',
    ],
    useCases: ['Accessible marketing sites', 'Design-system component libraries', 'Email and print-ready templates'],
    strengths: [
      { title: 'Accessibility-first', description: 'WCAG-aligned semantics, focus and contrast by default.' },
      { title: 'Modern CSS', description: 'Grid, container queries and custom properties for resilient layouts.' },
      { title: 'Performance', description: 'Minimal, critical-path CSS tuned for Core Web Vitals.' },
    ],
    icon: 'web',
  },
  {
    slug: 'javascript',
    name: 'Javascript',
    category: 'Frontend',
    summary: 'The language of the web, used well — typed, tested and performant.',
    overview: [
      'We build interactive experiences and services in modern JavaScript, favouring TypeScript for safety and clarity. From UI to tooling, we keep code maintainable and fast.',
    ],
    useCases: ['Rich web applications', 'Interactive data visualizations', 'Build tooling and automation'],
    strengths: [
      { title: 'TypeScript', description: 'Type safety that catches bugs before they ship.' },
      { title: 'Modern tooling', description: 'Fast bundlers, linting and testing wired into CI.' },
      { title: 'Performance', description: 'Code-splitting and profiling for snappy UIs.' },
    ],
    icon: 'code',
  },
  {
    slug: 'pwa',
    name: 'PWA',
    category: 'Frontend',
    summary: 'Installable, offline-capable web apps with native-like reliability.',
    overview: [
      'Progressive Web Apps give you app-store reach without the app store — installable, offline-capable and fast, with push notifications and background sync.',
    ],
    useCases: ['Offline-first field apps', 'Installable customer portals', 'Low-friction mobile experiences'],
    strengths: [
      { title: 'Offline support', description: 'Service workers and caching for reliability on any network.' },
      { title: 'Installable', description: 'Home-screen install with a native-like launch experience.' },
      { title: 'Engagement', description: 'Push notifications and background sync to re-engage users.' },
    ],
    icon: 'mobile',
  },
  {
    slug: 'react',
    name: 'React',
    category: 'Frontend',
    summary: 'Component-driven UIs at scale — our default for complex front-ends.',
    overview: [
      'React is our go-to library for building interactive, component-driven interfaces. We pair it with a typed, tested architecture that scales from MVP to enterprise.',
    ],
    useCases: ['SaaS dashboards', 'Customer portals', 'Design-system driven products'],
    strengths: [
      { title: 'Composability', description: 'Reusable components and hooks that keep UIs consistent.' },
      { title: 'Ecosystem', description: 'A mature ecosystem for routing, state and data fetching.' },
      { title: 'Performance', description: 'Memoization and concurrent rendering for smooth UX.' },
    ],
    icon: 'code',
  },
  {
    slug: 'angular',
    name: 'Angular',
    category: 'Frontend',
    summary: 'A batteries-included framework for large, structured enterprise front-ends.',
    overview: [
      'Angular brings structure and consistency to large teams and applications — with strong typing, dependency injection and a complete toolchain out of the box.',
    ],
    useCases: ['Enterprise admin consoles', 'Large multi-team front-ends', 'Regulated, structured applications'],
    strengths: [
      { title: 'Opinionated structure', description: 'Consistent patterns that scale across large teams.' },
      { title: 'TypeScript-native', description: 'First-class typing throughout the framework.' },
      { title: 'Tooling', description: 'A complete CLI, testing and build pipeline.' },
    ],
    icon: 'code',
  },
  {
    slug: 'vue-js',
    name: 'Vue.js',
    category: 'Frontend',
    summary: 'Approachable, high-performance UIs with an elegant developer experience.',
    overview: [
      'Vue balances simplicity and power, making it a great fit for teams that want fast delivery without sacrificing structure. We build reactive, maintainable interfaces with it.',
    ],
    useCases: ['Interactive marketing apps', 'Internal tools', 'Incrementally-adopted front-ends'],
    strengths: [
      { title: 'Gentle learning curve', description: 'Productive quickly without heavy boilerplate.' },
      { title: 'Reactivity', description: 'A fine-grained reactivity system for efficient updates.' },
      { title: 'Composition API', description: 'Reusable, typed logic across components.' },
    ],
    icon: 'code',
  },
  {
    slug: 'bootstrap',
    name: 'Bootstrap',
    category: 'Frontend',
    summary: 'Rapid, responsive UI delivery with a proven component system.',
    overview: [
      'When speed to market matters, Bootstrap gives us a reliable, responsive foundation — customized to your brand so it never looks off-the-shelf.',
    ],
    useCases: ['Rapid MVPs', 'Internal dashboards', 'Responsive marketing pages'],
    strengths: [
      { title: 'Speed', description: 'Ship responsive UIs fast with a mature grid and components.' },
      { title: 'Consistency', description: 'A predictable system that is easy to maintain.' },
      { title: 'Customizable', description: 'Themed to your brand so it feels bespoke.' },
    ],
    icon: 'web',
  },
  {
    slug: 'nextjs',
    name: 'NextJs',
    category: 'Frontend',
    summary: 'The React framework we reach for when performance and SEO matter.',
    overview: [
      'Next.js powers fast, SEO-friendly React applications with hybrid rendering, image optimization and first-class DX. It is our default for production web platforms.',
    ],
    useCases: ['High-performance web platforms', 'Content + commerce sites', 'SEO-critical applications'],
    strengths: [
      { title: 'Hybrid rendering', description: 'SSR, static export and edge delivery in one framework.' },
      { title: 'SEO & performance', description: 'Built-in tooling for Core Web Vitals and metadata.' },
      { title: 'DX', description: 'A productive, batteries-included developer experience.' },
    ],
    icon: 'web',
  },
  {
    slug: 'backbonjs',
    name: 'BackbonJS',
    category: 'Frontend',
    summary: 'Lightweight structure for legacy front-ends — maintained and modernized.',
    overview: [
      'Backbone.js still powers many production front-ends. We maintain, extend and incrementally modernize Backbone applications without disrupting the business.',
    ],
    useCases: ['Legacy app maintenance', 'Incremental modernization', 'Lightweight single-page apps'],
    strengths: [
      { title: 'Lightweight', description: 'Minimal footprint with clear MV* structure.' },
      { title: 'Maintainable', description: 'We keep existing Backbone apps healthy and secure.' },
      { title: 'Migration path', description: 'A pragmatic route to modern frameworks.' },
    ],
    icon: 'code',
  },
  // ---- Backend ----
  {
    slug: 'java',
    name: 'Java',
    category: 'Backend',
    summary: 'Enterprise-grade backends built for reliability and scale.',
    overview: [
      'Java remains a workhorse for high-reliability enterprise systems. We build robust services with Spring Boot, strong testing and clean, maintainable architecture.',
    ],
    useCases: ['Enterprise services', 'High-throughput APIs', 'Regulated financial systems'],
    strengths: [
      { title: 'Robust ecosystem', description: 'Spring Boot and a mature, battle-tested library set.' },
      { title: 'Performance', description: 'JVM tuning for high-throughput, low-latency workloads.' },
      { title: 'Reliability', description: 'Strong typing and testing for mission-critical systems.' },
    ],
    icon: 'server',
  },
  {
    slug: 'python',
    name: 'Python',
    category: 'Backend',
    summary: 'From APIs to AI — our most versatile backend and data language.',
    overview: [
      'Python powers our data engineering, machine learning and backend services alike. Its ecosystem lets us move fast from prototype to production across many domains.',
    ],
    useCases: ['Data & ML pipelines', 'REST/GraphQL APIs', 'Automation and scripting'],
    strengths: [
      { title: 'AI & data', description: 'The de-facto language for ML and data engineering.' },
      { title: 'Productivity', description: 'Readable, fast-to-write code with a huge ecosystem.' },
      { title: 'Frameworks', description: 'FastAPI and Django for clean, scalable services.' },
    ],
    icon: 'brain',
  },
  {
    slug: 'ruby',
    name: 'Ruby',
    category: 'Backend',
    summary: 'Developer-happy, convention-driven web apps that ship fast.',
    overview: [
      'Ruby on Rails lets small teams build and iterate quickly with sensible conventions. We use it to get products to market fast without sacrificing quality.',
    ],
    useCases: ['Rapid product MVPs', 'Marketplaces', 'Content-driven web apps'],
    strengths: [
      { title: 'Convention over configuration', description: 'Rails conventions that accelerate delivery.' },
      { title: 'Productivity', description: 'A pleasant, expressive language for fast iteration.' },
      { title: 'Mature ecosystem', description: 'Battle-tested gems for common needs.' },
    ],
    icon: 'server',
  },
  {
    slug: 'php',
    name: 'Php',
    category: 'Backend',
    summary: 'Modern PHP and Laravel backends — pragmatic and widely deployable.',
    overview: [
      'Modern PHP with Laravel is a productive, widely-hostable choice for web backends. We build clean, tested PHP services and maintain existing PHP estates.',
    ],
    useCases: ['Web application backends', 'CMS and commerce', 'Legacy PHP modernization'],
    strengths: [
      { title: 'Laravel', description: 'An elegant framework for expressive, testable code.' },
      { title: 'Wide hosting', description: 'Deployable almost anywhere, including shared hosts.' },
      { title: 'Ecosystem', description: 'A rich package ecosystem for common needs.' },
    ],
    icon: 'server',
  },
  {
    slug: 'node-js',
    name: 'Node.js',
    category: 'Backend',
    summary: 'Fast, event-driven services and APIs sharing one language with the front-end.',
    overview: [
      'Node.js lets us build fast, event-driven backends and real-time services in the same language as the front-end — great for APIs, streaming and serverless.',
    ],
    useCases: ['REST/GraphQL APIs', 'Real-time services', 'Serverless functions'],
    strengths: [
      { title: 'Non-blocking I/O', description: 'Efficient handling of concurrent connections.' },
      { title: 'Full-stack JS', description: 'One language across front-end and back-end.' },
      { title: 'Ecosystem', description: 'The largest package registry in the world.' },
    ],
    icon: 'server',
  },
  {
    slug: 'go-lang',
    name: 'Golang',
    category: 'Backend',
    summary: 'High-performance, concurrent services with a tiny operational footprint.',
    overview: [
      'Go is our choice for performance-critical services and infrastructure tooling — simple, fast and built for concurrency, with single-binary deployment.',
    ],
    useCases: ['High-throughput microservices', 'CLI and infra tooling', 'Networking and streaming'],
    strengths: [
      { title: 'Concurrency', description: 'Goroutines and channels for scalable parallelism.' },
      { title: 'Performance', description: 'Compiled speed with a small memory footprint.' },
      { title: 'Simplicity', description: 'Single-binary deploys and a lean standard library.' },
    ],
    icon: 'bolt',
  },
  {
    slug: 'spark-scala',
    name: 'Spark/Scala',
    category: 'Backend',
    summary: 'Big-data processing at scale for batch and streaming workloads.',
    overview: [
      'Apache Spark with Scala powers our large-scale data processing — distributed transforms, streaming analytics and ML pipelines over massive datasets.',
    ],
    useCases: ['Large-scale ETL', 'Streaming analytics', 'Distributed ML feature pipelines'],
    strengths: [
      { title: 'Distributed compute', description: 'Process terabytes with in-memory speed.' },
      { title: 'Unified batch + stream', description: 'One engine for both processing modes.' },
      { title: 'Type safety', description: 'Scala typing for robust data pipelines.' },
    ],
    icon: 'pipeline',
  },
  // ---- Mobile ----
  {
    slug: 'android',
    name: 'Android',
    category: 'Mobile',
    summary: 'Native Android apps engineered for performance across the device landscape.',
    overview: [
      'We build native Android apps with modern tooling — Jetpack, Kotlin and Material Design — tuned for performance across a fragmented device ecosystem.',
    ],
    useCases: ['Consumer mobile apps', 'Enterprise mobility', 'Hardware-integrated apps'],
    strengths: [
      { title: 'Jetpack & Kotlin', description: 'Modern, maintainable native development.' },
      { title: 'Performance', description: 'Optimized for a wide range of devices.' },
      { title: 'Material Design', description: 'Polished, platform-consistent UX.' },
    ],
    icon: 'mobile',
  },
  {
    slug: 'ios',
    name: 'iOS',
    category: 'Mobile',
    summary: 'Native iOS apps with Apple-grade polish and performance.',
    overview: [
      'We craft native iOS apps in Swift and SwiftUI that feel right at home on Apple platforms — smooth, accessible and deeply integrated with device capabilities.',
    ],
    useCases: ['Premium consumer apps', 'Enterprise iOS deployments', 'Hardware-connected apps'],
    strengths: [
      { title: 'Swift & SwiftUI', description: 'Modern, declarative native development.' },
      { title: 'Polish', description: 'Fluid, accessible, platform-native UX.' },
      { title: 'Integration', description: 'Deep use of device and ecosystem features.' },
    ],
    icon: 'mobile',
  },
  {
    slug: 'kotlin',
    name: 'Kotlin',
    category: 'Mobile',
    summary: 'A concise, safe language for Android and multiplatform code sharing.',
    overview: [
      'Kotlin is our default for native Android and, with Kotlin Multiplatform, for sharing business logic across platforms — concise, null-safe and fully interoperable with Java.',
    ],
    useCases: ['Native Android apps', 'Shared multiplatform logic', 'Java modernization'],
    strengths: [
      { title: 'Null safety', description: 'A type system that eliminates whole classes of bugs.' },
      { title: 'Conciseness', description: 'Expressive code that is fast to read and write.' },
      { title: 'Multiplatform', description: 'Share logic across Android, iOS and backend.' },
    ],
    icon: 'mobile',
  },
  {
    slug: 'reactive-native',
    name: 'React Native',
    category: 'Mobile',
    summary: 'Cross-platform mobile with native performance and shared React skills.',
    overview: [
      'React Native lets us ship to iOS and Android from one codebase while dropping to native modules where it counts — great for teams already invested in React.',
    ],
    useCases: ['Cross-platform consumer apps', 'MVPs on a budget', 'React-team mobile delivery'],
    strengths: [
      { title: 'Shared codebase', description: 'One team, both platforms, native components.' },
      { title: 'Native bridges', description: 'Drop to native for performance-critical paths.' },
      { title: 'Fast iteration', description: 'Hot reload and a rich ecosystem.' },
    ],
    icon: 'mobile',
  },
  {
    slug: 'flutter',
    name: 'Flutter',
    category: 'Mobile',
    summary: 'Pixel-perfect, high-performance apps from a single codebase.',
    overview: [
      'Flutter renders its own UI for true cross-platform consistency and 60/120fps performance. We use it to deliver beautiful, brand-accurate apps fast.',
    ],
    useCases: ['Design-forward apps', 'Cross-platform products', 'Rapid multi-platform delivery'],
    strengths: [
      { title: 'Consistent UI', description: 'The same pixel-perfect UI on every platform.' },
      { title: 'Performance', description: 'Compiled, GPU-accelerated rendering.' },
      { title: 'Velocity', description: 'Hot reload and a single codebase.' },
    ],
    icon: 'mobile',
  },
  // ---- Database ----
  {
    slug: 'sql-databases',
    name: 'SQL Databases',
    category: 'Database',
    summary: 'Well-modelled relational databases tuned for correctness and speed.',
    overview: [
      'We design and tune relational databases — PostgreSQL, MySQL and SQL Server — with sound schemas, indexing and query optimization for correctness and performance at scale.',
    ],
    useCases: ['Transactional systems', 'Reporting databases', 'High-integrity data stores'],
    strengths: [
      { title: 'Schema design', description: 'Normalized, well-indexed models that scale.' },
      { title: 'Query tuning', description: 'Optimized queries and indexes for fast reads.' },
      { title: 'Integrity', description: 'Constraints and transactions that protect data.' },
    ],
    icon: 'database',
  },
  {
    slug: 'data-warehouse',
    name: 'Data Warehouse',
    category: 'Database',
    summary: 'Cloud data warehouses that make analytics fast and cost-efficient.',
    overview: [
      'We build cloud data warehouses on Snowflake, BigQuery and Redshift — with dimensional models and cost controls that make analytics fast and predictable.',
    ],
    useCases: ['Enterprise analytics', 'Self-serve BI', 'Unified reporting layers'],
    strengths: [
      { title: 'Dimensional modelling', description: 'Analytics-ready models the business understands.' },
      { title: 'Scale', description: 'Elastic compute for heavy analytical workloads.' },
      { title: 'Cost control', description: 'Warehouse tuning that keeps spend predictable.' },
    ],
    icon: 'database',
  },
  {
    slug: 'dba-services',
    name: 'DBA Services',
    category: 'Database',
    summary: 'Managed database administration — performance, backups and high availability.',
    overview: [
      'Our DBA services keep your databases fast, safe and available — performance tuning, backup and recovery, replication and 24/7 monitoring.',
    ],
    useCases: ['Production database operations', 'Performance remediation', 'Disaster-recovery readiness'],
    strengths: [
      { title: 'Performance tuning', description: 'Ongoing optimization of queries and configuration.' },
      { title: 'Backup & recovery', description: 'Tested backups and clear recovery objectives.' },
      { title: 'High availability', description: 'Replication and failover for resilience.' },
    ],
    icon: 'database',
  },
  {
    slug: 'in-memory-cache-services',
    name: 'In Memory Cache Services',
    category: 'Database',
    summary: 'Sub-millisecond caching that keeps applications fast under load.',
    overview: [
      'We design caching layers with Redis and Memcached to cut latency and offload databases — with sound invalidation strategies that keep data fresh.',
    ],
    useCases: ['Low-latency read paths', 'Session and rate-limit stores', 'Real-time leaderboards & queues'],
    strengths: [
      { title: 'Sub-ms latency', description: 'In-memory reads that keep UIs instant.' },
      { title: 'Scalability', description: 'Clustered caches that absorb traffic spikes.' },
      { title: 'Smart invalidation', description: 'Strategies that keep cached data correct.' },
    ],
    icon: 'bolt',
  },
];

export const technologyBySlug = Object.fromEntries(technologyPages.map((t) => [t.slug, t]));
export const technologySlugs = technologyPages.map((t) => t.slug);

export const technologyCategories: TechnologyPage['category'][] = [
  'Frontend',
  'Backend',
  'Mobile',
  'Database',
];
