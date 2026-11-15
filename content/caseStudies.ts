import type { CaseStudy } from './types';

/**
 * The 8 featured success stories. Titles + slugs are VERBATIM from the live
 * site. Detail copy (challenge/approach/solution/results) and metrics are
 * representative, brand-consistent narratives — replace with the exact live
 * case-study copy and confirmed client metrics where available (TODO_ASSETS §3).
 */
export const caseStudies: CaseStudy[] = [
  {
    slug: 'codevyasa-a-reliable-tech-partner-for-international-giants',
    title: 'CodeVyasa: A reliable Tech partner for International Giants',
    client: 'Fortune-500 Enterprises',
    clientAnonymized: true,
    industry: 'Enterprise',
    service: 'Product Engineering',
    outcome: 'Became the long-term delivery partner powering platforms for international giants.',
    metrics: [
      { value: '4X', label: 'Operational efficiency' },
      { value: '99.9%', label: 'Platform uptime' },
    ],
    heroImage: '/assets/case-studies/codevyasa-a-reliable-tech-partner-for-international-giants.svg',
    tags: ['Enterprise', 'Product Engineering', 'Managed Teams'],
    challenge: [
      'Large international organizations needed a dependable engineering partner that could scale specialized talent up and down without the overhead of hiring, while meeting enterprise standards for security and reliability.',
      'Existing vendors struggled to keep sprint velocity predictable across time zones and multiple concurrent workstreams.',
    ],
    approach: [
      'We embedded cross-functional pods that plugged directly into each client’s delivery cadence, owning features end to end rather than acting as a staffing desk.',
      'A shared engineering playbook — coding standards, CI gates, and observability — kept quality consistent across every team.',
    ],
    solution: [
      'Delivered and maintained mission-critical platform modules with automated testing and progressive delivery.',
      'Instituted SLA-backed support and on-call rotations to keep operations running around the clock.',
    ],
    results: [
      'Quadrupled operational efficiency across the engaged workstreams.',
      'Sustained 99.9% platform uptime with predictable, on-time delivery.',
      'Grew from a single pilot team into a multi-year strategic partnership.',
    ],
    techStack: ['Java', 'Node.js', 'React', 'AWS', 'PostgreSQL', 'Kubernetes'],
  },
  {
    slug: 'propelling-early-stage-tech-ventures-to-unprecedented-heights',
    title: 'Propelling Early-Stage Tech Ventures to Unprecedented Heights',
    client: 'Early-Stage Ventures',
    clientAnonymized: true,
    industry: 'Startups / SaaS',
    service: 'Product Engineering',
    outcome: 'Helped funded startups ship faster and extend runway with lean, senior pods.',
    metrics: [
      { value: '3X', label: 'Faster time-to-market' },
      { value: '60%', label: 'Lower build cost' },
    ],
    heroImage: '/assets/case-studies/propelling-early-stage-tech-ventures-to-unprecedented-heights.svg',
    tags: ['Startups', 'MVP', 'Product Engineering'],
    challenge: [
      'Early-stage founders needed to turn a validated idea into a fundable product quickly, without the cost and risk of assembling a full in-house team first.',
      'Every week of delay meant burning runway and losing ground to competitors.',
    ],
    approach: [
      'We ran tight discovery to define a sharp MVP scope, then stood up a senior full-stack pod that shipped in weekly increments.',
      'Architecture decisions favoured speed today and scale tomorrow, avoiding costly rewrites after funding.',
    ],
    solution: [
      'Delivered production-ready MVPs with analytics and a clean path to scale built in.',
      'Iterated rapidly on real user feedback to reach product-market signal.',
    ],
    results: [
      'Cut time-to-market by 3X versus building an in-house team from scratch.',
      'Reduced build cost by roughly 60% through lean, senior pods.',
      'Several ventures used the delivered product to raise their next round.',
    ],
    techStack: ['Next.js', 'Node.js', 'React Native', 'PostgreSQL', 'AWS'],
  },
  {
    slug: 'from-startup-to-unicorn-our-journey-with-50-pioneers',
    title: 'From Startup to Unicorn: Our Journey with 50+ Pioneers',
    client: 'Venture-backed Startups',
    clientAnonymized: true,
    industry: 'SaaS / Fintech',
    service: 'Product & Platform',
    outcome: 'Scaled 50+ pioneering products from first release to hyper-growth.',
    metrics: [
      { value: '50+', label: 'Startups scaled' },
      { value: '10X', label: 'User growth supported' },
    ],
    heroImage: '/assets/case-studies/from-startup-to-unicorn-our-journey-with-50-pioneers.svg',
    tags: ['Scale-up', 'Platform', 'Fintech'],
    challenge: [
      'Fast-growing startups hit scaling walls — architectures that worked at launch buckled under 10X traffic, and teams could not hire fast enough to keep up.',
      'They needed engineering partners who had scaled products before and could do it without disrupting momentum.',
    ],
    approach: [
      'We re-architected hot paths for horizontal scale, introduced caching and async processing, and hardened observability.',
      'Delivery pods scaled alongside the product, absorbing spikes in scope during growth phases.',
    ],
    solution: [
      'Rebuilt critical services for resilience and throughput, with load testing to prove headroom.',
      'Automated infrastructure and deployments so scaling was routine, not risky.',
    ],
    results: [
      'Partnered on 50+ products from early stage into hyper-growth.',
      'Supported up to 10X user growth without performance regressions.',
      'Multiple partners went on to reach unicorn valuations.',
    ],
    techStack: ['Go', 'React', 'Kafka', 'Redis', 'PostgreSQL', 'Kubernetes'],
  },
  {
    slug: 'codevyasas-impact-through-automation-qa',
    title: "CodeVyasa's Impact through Automation QA",
    client: 'Global SaaS Platform',
    clientAnonymized: true,
    industry: 'SaaS',
    service: 'Quality Engineering',
    outcome: 'Replaced slow manual testing with automation that made releases fast and safe.',
    metrics: [
      { value: '90%', label: 'Faster regression cycles' },
      { value: '70%', label: 'Fewer production defects' },
    ],
    heroImage: '/assets/case-studies/codevyasas-impact-through-automation-qa.svg',
    tags: ['QA', 'Test Automation', 'CI/CD'],
    challenge: [
      'Manual regression testing had become the bottleneck to shipping — release cycles stretched for days, and defects still slipped into production.',
      'The team needed confidence to release frequently without ballooning QA headcount.',
    ],
    approach: [
      'We built a maintainable automation framework covering UI, API and end-to-end flows, wired directly into the CI pipeline.',
      'Risk-based test design focused effort where defects were most costly.',
    ],
    solution: [
      'Automated the critical regression suite and added quality gates that block regressions before merge.',
      'Introduced performance and smoke tests to catch issues early.',
    ],
    results: [
      'Cut regression cycle time by roughly 90%.',
      'Reduced production defects by around 70%.',
      'Enabled confident, frequent releases with objective quality gates.',
    ],
    techStack: ['Playwright', 'Python', 'JavaScript', 'GitHub Actions', 'Docker'],
  },
  {
    slug: 'enhancing-data-pipelines-strengthening-connectivity-with-advanced-engineering',
    title: 'Enhancing Data Pipelines: Strengthening Connectivity with Advanced Engineering',
    client: 'Data-driven Enterprise',
    clientAnonymized: true,
    industry: 'Data / Connectivity',
    service: 'Data Engineering',
    outcome: 'Rebuilt fragile pipelines into a reliable, high-throughput data backbone.',
    metrics: [
      { value: '5X', label: 'Pipeline throughput' },
      { value: '99.99%', label: 'Data reliability' },
    ],
    heroImage: '/assets/case-studies/enhancing-data-pipelines-strengthening-connectivity-with-advanced-engineering.svg',
    tags: ['Data Engineering', 'Pipelines', 'Streaming'],
    challenge: [
      'Brittle, batch-only pipelines could not keep up with data volume, and silent failures eroded trust in downstream analytics.',
      'The business needed fresher, more reliable data to make timely decisions.',
    ],
    approach: [
      'We re-designed ingestion around a scalable streaming backbone with schema enforcement and idempotent processing.',
      'Data-quality checks and lineage-aware alerting made reliability measurable.',
    ],
    solution: [
      'Delivered unified batch + streaming pipelines with observability at every stage.',
      'Automated backfills and replays so incidents were quick to recover from.',
    ],
    results: [
      'Increased pipeline throughput by 5X.',
      'Achieved 99.99% data reliability with proactive monitoring.',
      'Restored full trust in analytics across the organization.',
    ],
    techStack: ['Spark', 'Scala', 'Kafka', 'Airflow', 'Snowflake', 'Python'],
  },
  {
    slug: 'securing-energy-systems-fortifying-connectivity-with-embedded-technology',
    title: 'Securing Energy Systems: Fortifying Connectivity with Embedded Technology',
    client: 'Energy Systems Provider',
    clientAnonymized: true,
    industry: 'Energy / IoT',
    service: 'Embedded & IoT',
    outcome: 'Hardened connected energy devices for security and always-on reliability.',
    metrics: [
      { value: '0', label: 'Security incidents' },
      { value: '24/7', label: 'Device uptime' },
    ],
    heroImage: '/assets/case-studies/securing-energy-systems-fortifying-connectivity-with-embedded-technology.svg',
    tags: ['IoT', 'Embedded', 'Security'],
    challenge: [
      'Connected energy infrastructure demanded ironclad security and continuous availability — a single compromised device or outage could have serious consequences.',
      'Legacy firmware lacked secure update mechanisms and robust connectivity.',
    ],
    approach: [
      'We re-engineered device firmware with secure boot, signed OTA updates and encrypted transport.',
      'Hardware-in-the-loop testing validated behaviour under real-world fault conditions.',
    ],
    solution: [
      'Delivered a secure device-to-cloud stack with resilient connectivity and remote management.',
      'Instrumented fleet telemetry for real-time monitoring and anomaly detection.',
    ],
    results: [
      'Zero security incidents across the deployed fleet.',
      'Maintained 24/7 device uptime with resilient connectivity.',
      'Enabled safe, remote firmware updates at scale.',
    ],
    techStack: ['C', 'C++', 'FreeRTOS', 'MQTT', 'AWS IoT', 'Go'],
  },
  {
    slug: 'devops-and-sre-helping-enterprises-achieve-operational-efficiency',
    title: 'DevOps and SRE : Helping enterprises achieve operational efficiency',
    client: 'Enterprise IT Organization',
    clientAnonymized: true,
    industry: 'Enterprise',
    service: 'DevOps & SRE',
    outcome: 'Turned slow, risky deployments into safe, automated, everyday releases.',
    metrics: [
      { value: '80%', label: 'Faster deployments' },
      { value: '65%', label: 'Less downtime' },
    ],
    heroImage: '/assets/case-studies/devops-and-sre-helping-enterprises-achieve-operational-efficiency.svg',
    tags: ['DevOps', 'SRE', 'Automation'],
    challenge: [
      'Deployments were manual, infrequent and stressful, and incidents took too long to resolve because observability was thin.',
      'The organization needed to ship more often with far less risk.',
    ],
    approach: [
      'We modernized CI/CD with progressive delivery, codified infrastructure, and introduced SLOs and error budgets.',
      'Observability was unified so on-call teams could diagnose issues in minutes, not hours.',
    ],
    solution: [
      'Automated build, test and deploy end to end with safe rollbacks.',
      'Established SRE practices that made reliability a shared, measurable goal.',
    ],
    results: [
      'Reduced deployment time by around 80%.',
      'Cut downtime by roughly 65% with faster recovery.',
      'Made releases routine and low-stress for every team.',
    ],
    techStack: ['Terraform', 'Kubernetes', 'ArgoCD', 'Prometheus', 'Grafana', 'Go'],
  },
  {
    slug: 'up-grad',
    title: "Revolutionizing Southeast Asia's Premier Edtech Company through Full Automation",
    client: 'upGrad',
    clientAnonymized: false,
    industry: 'Edtech',
    service: 'Automation / QA',
    outcome: 'Automated an edtech leader’s delivery pipeline end to end for full-speed releases.',
    metrics: [
      { value: '4X', label: 'Release velocity' },
      { value: '85%', label: 'Test automation coverage' },
    ],
    heroImage: '/assets/case-studies/up-grad.svg',
    tags: ['Edtech', 'Automation', 'QA'],
    challenge: [
      'A premier Southeast Asian edtech company needed to release far more frequently to keep up with demand, but manual processes across QA and deployment held them back.',
      'Quality had to improve at the same time as speed.',
    ],
    approach: [
      'We automated the full delivery pipeline — from test automation to continuous deployment — and embedded quality gates throughout.',
      'Flaky, manual steps were replaced with reliable, repeatable automation.',
    ],
    solution: [
      'Built comprehensive automated test coverage across web and mobile.',
      'Wired everything into CI/CD so releases became continuous and safe.',
    ],
    results: [
      'Increased release velocity by 4X.',
      'Reached 85% automated test coverage.',
      'Delivered faster releases with higher quality, at scale.',
    ],
    techStack: ['Selenium', 'Appium', 'Java', 'Jenkins', 'Docker', 'AWS'],
  },
];

export const caseStudyBySlug = Object.fromEntries(caseStudies.map((c) => [c.slug, c]));
export const caseStudySlugs = caseStudies.map((c) => c.slug);

export const caseStudyIndustries = Array.from(new Set(caseStudies.map((c) => c.industry)));
export const caseStudyServices = Array.from(new Set(caseStudies.map((c) => c.service)));
