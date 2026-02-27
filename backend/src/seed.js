/**
 * Database Seed Script for SmartHire AI
 *
 * Seeds the MongoDB database with:
 * - 150+ skills across all categories
 * - 10 sample job roles with required skills
 * - 20 sample courses from various providers
 * - 1 default admin user
 *
 * Usage: node src/seed.js
 */

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { mongodbUri } = require('./config/env');
const Skill = require('./models/Skill');
const JobRole = require('./models/JobRole');
const Course = require('./models/Course');
const User = require('./models/User');

// ---------------------------------------------------------------------------
// Skills Data (150+ across all categories)
// ---------------------------------------------------------------------------
const skillsData = [
  // ── Programming Languages ───────────────────────────────────────────────
  { name: 'JavaScript', category: 'Programming Languages', aliases: ['JS', 'ECMAScript', 'ES6', 'ES2015+'], weight: 2.5 },
  { name: 'TypeScript', category: 'Programming Languages', aliases: ['TS'], weight: 2.3 },
  { name: 'Python', category: 'Programming Languages', aliases: ['Python3', 'Py'], weight: 2.5 },
  { name: 'Java', category: 'Programming Languages', aliases: ['Java SE', 'Java EE', 'J2EE'], weight: 2.4 },
  { name: 'C++', category: 'Programming Languages', aliases: ['CPP', 'Cplusplus', 'C plus plus'], weight: 2.0 },
  { name: 'C#', category: 'Programming Languages', aliases: ['CSharp', 'C Sharp', 'Csharp'], weight: 2.1 },
  { name: 'Go', category: 'Programming Languages', aliases: ['Golang'], weight: 2.0 },
  { name: 'Rust', category: 'Programming Languages', aliases: ['Rust Lang'], weight: 1.8 },
  { name: 'Ruby', category: 'Programming Languages', aliases: ['Ruby Lang'], weight: 1.7 },
  { name: 'PHP', category: 'Programming Languages', aliases: ['PHP8', 'PHP7'], weight: 1.8 },
  { name: 'Swift', category: 'Programming Languages', aliases: ['Swift Lang', 'Apple Swift'], weight: 1.9 },
  { name: 'Kotlin', category: 'Programming Languages', aliases: ['Kotlin Lang', 'KT'], weight: 1.9 },
  { name: 'Scala', category: 'Programming Languages', aliases: ['Scala Lang'], weight: 1.6 },
  { name: 'R', category: 'Programming Languages', aliases: ['R Lang', 'R Language'], weight: 1.5 },
  { name: 'Dart', category: 'Programming Languages', aliases: ['Dart Lang'], weight: 1.5 },
  { name: 'Elixir', category: 'Programming Languages', aliases: ['Elixir Lang'], weight: 1.3 },
  { name: 'Haskell', category: 'Programming Languages', aliases: ['Haskell Lang'], weight: 1.2 },
  { name: 'Perl', category: 'Programming Languages', aliases: ['Perl5', 'Perl6'], weight: 1.1 },
  { name: 'Lua', category: 'Programming Languages', aliases: ['Lua Lang'], weight: 1.0 },
  { name: 'C', category: 'Programming Languages', aliases: ['C Lang', 'ANSI C'], weight: 1.8 },
  { name: 'Objective-C', category: 'Programming Languages', aliases: ['ObjC', 'Obj-C'], weight: 1.3 },
  { name: 'Shell Scripting', category: 'Programming Languages', aliases: ['Bash', 'Shell', 'Zsh', 'Sh'], weight: 1.5 },
  { name: 'SQL', category: 'Programming Languages', aliases: ['Structured Query Language'], weight: 2.2 },
  { name: 'MATLAB', category: 'Programming Languages', aliases: ['Matrix Laboratory'], weight: 1.2 },

  // ── Web Frameworks ──────────────────────────────────────────────────────
  { name: 'React', category: 'Web Frameworks', aliases: ['React.js', 'ReactJS', 'React 18'], weight: 2.8 },
  { name: 'Angular', category: 'Web Frameworks', aliases: ['Angular 2+', 'AngularJS', 'Angular 17'], weight: 2.3 },
  { name: 'Vue.js', category: 'Web Frameworks', aliases: ['Vue', 'VueJS', 'Vue 3'], weight: 2.1 },
  { name: 'Next.js', category: 'Web Frameworks', aliases: ['NextJS', 'Next'], weight: 2.4 },
  { name: 'Express.js', category: 'Web Frameworks', aliases: ['Express', 'ExpressJS'], weight: 2.2 },
  { name: 'Django', category: 'Web Frameworks', aliases: ['Django Framework', 'Django REST'], weight: 2.0 },
  { name: 'Flask', category: 'Web Frameworks', aliases: ['Flask Framework', 'Flask Python'], weight: 1.7 },
  { name: 'Spring Boot', category: 'Web Frameworks', aliases: ['Spring', 'Spring Framework', 'Spring MVC'], weight: 2.2 },
  { name: '.NET', category: 'Web Frameworks', aliases: ['DotNet', 'ASP.NET', '.NET Core', 'ASP.NET Core'], weight: 2.1 },
  { name: 'Node.js', category: 'Web Frameworks', aliases: ['NodeJS', 'Node'], weight: 2.6 },
  { name: 'Ruby on Rails', category: 'Web Frameworks', aliases: ['Rails', 'RoR'], weight: 1.8 },
  { name: 'Laravel', category: 'Web Frameworks', aliases: ['Laravel PHP'], weight: 1.7 },
  { name: 'FastAPI', category: 'Web Frameworks', aliases: ['Fast API'], weight: 1.9 },
  { name: 'Svelte', category: 'Web Frameworks', aliases: ['SvelteKit', 'Svelte.js'], weight: 1.6 },
  { name: 'NestJS', category: 'Web Frameworks', aliases: ['Nest.js', 'Nest'], weight: 1.8 },
  { name: 'Nuxt.js', category: 'Web Frameworks', aliases: ['NuxtJS', 'Nuxt'], weight: 1.5 },
  { name: 'Gatsby', category: 'Web Frameworks', aliases: ['GatsbyJS', 'Gatsby.js'], weight: 1.3 },
  { name: 'Remix', category: 'Web Frameworks', aliases: ['Remix.run'], weight: 1.4 },
  { name: 'Tailwind CSS', category: 'Web Frameworks', aliases: ['TailwindCSS', 'Tailwind'], weight: 1.8 },
  { name: 'Bootstrap', category: 'Web Frameworks', aliases: ['Bootstrap 5', 'Twitter Bootstrap'], weight: 1.4 },
  { name: 'GraphQL', category: 'Web Frameworks', aliases: ['GQL', 'Graph QL'], weight: 1.9 },
  { name: 'REST API', category: 'Web Frameworks', aliases: ['RESTful', 'REST', 'RESTful API'], weight: 2.0 },
  { name: 'Astro', category: 'Web Frameworks', aliases: ['Astro.build'], weight: 1.2 },

  // ── Databases ───────────────────────────────────────────────────────────
  { name: 'MongoDB', category: 'Databases', aliases: ['Mongo', 'Mongo DB'], weight: 2.2 },
  { name: 'PostgreSQL', category: 'Databases', aliases: ['Postgres', 'PG', 'PGSQL'], weight: 2.3 },
  { name: 'MySQL', category: 'Databases', aliases: ['My SQL'], weight: 2.0 },
  { name: 'Redis', category: 'Databases', aliases: ['Redis Cache', 'Redis DB'], weight: 1.9 },
  { name: 'Elasticsearch', category: 'Databases', aliases: ['ES', 'Elastic Search', 'ELK'], weight: 1.8 },
  { name: 'SQLite', category: 'Databases', aliases: ['SQLite3'], weight: 1.3 },
  { name: 'Oracle DB', category: 'Databases', aliases: ['Oracle', 'Oracle Database', 'OracleDB'], weight: 1.7 },
  { name: 'SQL Server', category: 'Databases', aliases: ['MSSQL', 'Microsoft SQL Server', 'MS SQL'], weight: 1.8 },
  { name: 'DynamoDB', category: 'Databases', aliases: ['AWS DynamoDB', 'Dynamo DB'], weight: 1.6 },
  { name: 'Cassandra', category: 'Databases', aliases: ['Apache Cassandra'], weight: 1.5 },
  { name: 'Firebase', category: 'Databases', aliases: ['Firebase DB', 'Firestore', 'Firebase Realtime DB'], weight: 1.6 },
  { name: 'Neo4j', category: 'Databases', aliases: ['Neo4j Graph DB'], weight: 1.3 },
  { name: 'CouchDB', category: 'Databases', aliases: ['Apache CouchDB', 'Couch DB'], weight: 1.1 },
  { name: 'MariaDB', category: 'Databases', aliases: ['Maria DB'], weight: 1.4 },
  { name: 'Supabase', category: 'Databases', aliases: ['Supa Base'], weight: 1.3 },

  // ── Cloud & DevOps ──────────────────────────────────────────────────────
  { name: 'AWS', category: 'Cloud & DevOps', aliases: ['Amazon Web Services', 'Amazon AWS'], weight: 2.5 },
  { name: 'Azure', category: 'Cloud & DevOps', aliases: ['Microsoft Azure', 'MS Azure'], weight: 2.2 },
  { name: 'GCP', category: 'Cloud & DevOps', aliases: ['Google Cloud', 'Google Cloud Platform'], weight: 2.0 },
  { name: 'Docker', category: 'Cloud & DevOps', aliases: ['Docker Containers', 'Containerization'], weight: 2.4 },
  { name: 'Kubernetes', category: 'Cloud & DevOps', aliases: ['K8s', 'Kube'], weight: 2.2 },
  { name: 'Terraform', category: 'Cloud & DevOps', aliases: ['TF', 'HashiCorp Terraform', 'IaC'], weight: 2.0 },
  { name: 'CI/CD', category: 'Cloud & DevOps', aliases: ['Continuous Integration', 'Continuous Deployment', 'CICD'], weight: 2.1 },
  { name: 'Jenkins', category: 'Cloud & DevOps', aliases: ['Jenkins CI'], weight: 1.7 },
  { name: 'GitHub Actions', category: 'Cloud & DevOps', aliases: ['GH Actions', 'GHA'], weight: 1.8 },
  { name: 'GitLab CI', category: 'Cloud & DevOps', aliases: ['GitLab CI/CD', 'GitLab Pipeline'], weight: 1.5 },
  { name: 'Ansible', category: 'Cloud & DevOps', aliases: ['Ansible Automation'], weight: 1.6 },
  { name: 'Nginx', category: 'Cloud & DevOps', aliases: ['NGINX', 'Engine-X'], weight: 1.5 },
  { name: 'Linux', category: 'Cloud & DevOps', aliases: ['Linux Administration', 'Linux Sysadmin'], weight: 2.0 },
  { name: 'Prometheus', category: 'Cloud & DevOps', aliases: ['Prometheus Monitoring'], weight: 1.4 },
  { name: 'Grafana', category: 'Cloud & DevOps', aliases: ['Grafana Dashboard'], weight: 1.3 },
  { name: 'Helm', category: 'Cloud & DevOps', aliases: ['Helm Charts', 'Helm K8s'], weight: 1.4 },
  { name: 'Serverless', category: 'Cloud & DevOps', aliases: ['AWS Lambda', 'Serverless Framework', 'FaaS'], weight: 1.7 },
  { name: 'CloudFormation', category: 'Cloud & DevOps', aliases: ['AWS CloudFormation', 'CFN'], weight: 1.3 },
  { name: 'Pulumi', category: 'Cloud & DevOps', aliases: ['Pulumi IaC'], weight: 1.1 },
  { name: 'ArgoCD', category: 'Cloud & DevOps', aliases: ['Argo CD', 'Argo Continuous Delivery'], weight: 1.2 },

  // ── Data Science & ML ───────────────────────────────────────────────────
  { name: 'TensorFlow', category: 'Data Science & ML', aliases: ['TF', 'TensorFlow 2'], weight: 2.3 },
  { name: 'PyTorch', category: 'Data Science & ML', aliases: ['Torch', 'PyTorch Lightning'], weight: 2.3 },
  { name: 'Pandas', category: 'Data Science & ML', aliases: ['Pandas Python'], weight: 2.0 },
  { name: 'scikit-learn', category: 'Data Science & ML', aliases: ['sklearn', 'Scikit Learn', 'SKLearn'], weight: 2.0 },
  { name: 'NLP', category: 'Data Science & ML', aliases: ['Natural Language Processing', 'Text Analytics'], weight: 2.1 },
  { name: 'Computer Vision', category: 'Data Science & ML', aliases: ['CV', 'Image Recognition', 'Object Detection'], weight: 2.0 },
  { name: 'NumPy', category: 'Data Science & ML', aliases: ['Numpy', 'Numerical Python'], weight: 1.8 },
  { name: 'Keras', category: 'Data Science & ML', aliases: ['Keras API'], weight: 1.6 },
  { name: 'OpenCV', category: 'Data Science & ML', aliases: ['Open CV', 'cv2'], weight: 1.5 },
  { name: 'Spark', category: 'Data Science & ML', aliases: ['Apache Spark', 'PySpark'], weight: 1.8 },
  { name: 'Hadoop', category: 'Data Science & ML', aliases: ['Apache Hadoop', 'HDFS', 'MapReduce'], weight: 1.4 },
  { name: 'Tableau', category: 'Data Science & ML', aliases: ['Tableau Desktop', 'Tableau Viz'], weight: 1.5 },
  { name: 'Power BI', category: 'Data Science & ML', aliases: ['PowerBI', 'Microsoft Power BI'], weight: 1.5 },
  { name: 'Deep Learning', category: 'Data Science & ML', aliases: ['DL', 'Neural Networks', 'DNN'], weight: 2.2 },
  { name: 'MLOps', category: 'Data Science & ML', aliases: ['ML Operations', 'Machine Learning Operations'], weight: 1.7 },
  { name: 'Hugging Face', category: 'Data Science & ML', aliases: ['HuggingFace', 'Transformers Library'], weight: 1.8 },
  { name: 'LLMs', category: 'Data Science & ML', aliases: ['Large Language Models', 'GPT', 'Generative AI', 'GenAI'], weight: 2.5 },
  { name: 'Data Visualization', category: 'Data Science & ML', aliases: ['DataViz', 'Matplotlib', 'Seaborn', 'D3.js'], weight: 1.6 },

  // ── Mobile Development ──────────────────────────────────────────────────
  { name: 'React Native', category: 'Mobile Development', aliases: ['RN', 'React Native CLI', 'Expo'], weight: 2.2 },
  { name: 'Flutter', category: 'Mobile Development', aliases: ['Flutter SDK', 'Flutter Dart'], weight: 2.1 },
  { name: 'iOS Development', category: 'Mobile Development', aliases: ['iOS', 'iPhone Development', 'Apple Development'], weight: 2.0 },
  { name: 'Android Development', category: 'Mobile Development', aliases: ['Android', 'Android SDK', 'Android Studio'], weight: 2.0 },
  { name: 'SwiftUI', category: 'Mobile Development', aliases: ['Swift UI'], weight: 1.7 },
  { name: 'Jetpack Compose', category: 'Mobile Development', aliases: ['Compose', 'Android Compose'], weight: 1.6 },
  { name: 'Xamarin', category: 'Mobile Development', aliases: ['Xamarin Forms', 'Xamarin.Forms'], weight: 1.2 },
  { name: 'Ionic', category: 'Mobile Development', aliases: ['Ionic Framework', 'Ionic Angular'], weight: 1.3 },
  { name: 'PWA', category: 'Mobile Development', aliases: ['Progressive Web App', 'Progressive Web Apps'], weight: 1.4 },

  // ── Testing ─────────────────────────────────────────────────────────────
  { name: 'Jest', category: 'Testing', aliases: ['Jest Testing', 'Jest Framework'], weight: 2.0 },
  { name: 'Cypress', category: 'Testing', aliases: ['Cypress.io', 'Cypress E2E'], weight: 1.9 },
  { name: 'Selenium', category: 'Testing', aliases: ['Selenium WebDriver', 'Selenium IDE'], weight: 1.7 },
  { name: 'Playwright', category: 'Testing', aliases: ['Playwright Testing', 'MS Playwright'], weight: 1.8 },
  { name: 'Mocha', category: 'Testing', aliases: ['Mocha.js', 'MochaJS'], weight: 1.4 },
  { name: 'JUnit', category: 'Testing', aliases: ['JUnit 5', 'JUnit Testing'], weight: 1.5 },
  { name: 'PyTest', category: 'Testing', aliases: ['Pytest', 'py.test'], weight: 1.6 },
  { name: 'Testing Library', category: 'Testing', aliases: ['React Testing Library', 'RTL'], weight: 1.7 },
  { name: 'Vitest', category: 'Testing', aliases: ['Vitest Testing'], weight: 1.4 },
  { name: 'Postman', category: 'Testing', aliases: ['Postman API', 'Postman Testing'], weight: 1.5 },
  { name: 'k6', category: 'Testing', aliases: ['Grafana k6', 'Load Testing'], weight: 1.2 },
  { name: 'Storybook', category: 'Testing', aliases: ['StorybookJS', 'Component Testing'], weight: 1.3 },

  // ── Tools & Platforms ───────────────────────────────────────────────────
  { name: 'Git', category: 'Tools & Platforms', aliases: ['Git VCS', 'Version Control'], weight: 2.5 },
  { name: 'GitHub', category: 'Tools & Platforms', aliases: ['GH', 'GitHub.com'], weight: 2.0 },
  { name: 'Jira', category: 'Tools & Platforms', aliases: ['Atlassian Jira', 'Jira Software'], weight: 1.6 },
  { name: 'Confluence', category: 'Tools & Platforms', aliases: ['Atlassian Confluence'], weight: 1.2 },
  { name: 'VS Code', category: 'Tools & Platforms', aliases: ['Visual Studio Code', 'VSCode'], weight: 1.3 },
  { name: 'IntelliJ IDEA', category: 'Tools & Platforms', aliases: ['IntelliJ', 'JetBrains IntelliJ'], weight: 1.2 },
  { name: 'Webpack', category: 'Tools & Platforms', aliases: ['Webpack 5'], weight: 1.5 },
  { name: 'Vite', category: 'Tools & Platforms', aliases: ['ViteJS', 'Vite.js'], weight: 1.5 },
  { name: 'npm', category: 'Tools & Platforms', aliases: ['Node Package Manager', 'npmjs'], weight: 1.4 },
  { name: 'Yarn', category: 'Tools & Platforms', aliases: ['Yarn Package Manager', 'Yarn Berry'], weight: 1.2 },
  { name: 'Slack', category: 'Tools & Platforms', aliases: ['Slack Messaging'], weight: 1.0 },
  { name: 'Notion', category: 'Tools & Platforms', aliases: ['Notion.so'], weight: 1.0 },
  { name: 'Vercel', category: 'Tools & Platforms', aliases: ['Vercel Hosting', 'ZEIT'], weight: 1.3 },
  { name: 'Netlify', category: 'Tools & Platforms', aliases: ['Netlify Hosting'], weight: 1.2 },
  { name: 'RabbitMQ', category: 'Tools & Platforms', aliases: ['Rabbit MQ', 'AMQP'], weight: 1.4 },
  { name: 'Kafka', category: 'Tools & Platforms', aliases: ['Apache Kafka', 'Kafka Streams'], weight: 1.7 },

  // ── Soft Skills ─────────────────────────────────────────────────────────
  { name: 'Communication', category: 'Soft Skills', aliases: ['Verbal Communication', 'Written Communication'], weight: 1.5 },
  { name: 'Teamwork', category: 'Soft Skills', aliases: ['Team Collaboration', 'Collaboration'], weight: 1.5 },
  { name: 'Problem Solving', category: 'Soft Skills', aliases: ['Problem-Solving', 'Analytical Thinking'], weight: 1.8 },
  { name: 'Leadership', category: 'Soft Skills', aliases: ['Team Leadership', 'Technical Leadership'], weight: 1.7 },
  { name: 'Time Management', category: 'Soft Skills', aliases: ['Time-Management', 'Prioritization'], weight: 1.3 },
  { name: 'Agile', category: 'Soft Skills', aliases: ['Agile Methodology', 'Scrum', 'Agile/Scrum', 'Kanban'], weight: 1.8 },
  { name: 'Critical Thinking', category: 'Soft Skills', aliases: ['Analytical Skills', 'Logical Thinking'], weight: 1.4 },
  { name: 'Mentoring', category: 'Soft Skills', aliases: ['Coaching', 'Technical Mentoring'], weight: 1.3 },
  { name: 'Presentation Skills', category: 'Soft Skills', aliases: ['Public Speaking', 'Technical Presentations'], weight: 1.2 },
  { name: 'Project Management', category: 'Soft Skills', aliases: ['PM', 'Technical Project Management'], weight: 1.6 },

  // ── Design ──────────────────────────────────────────────────────────────
  { name: 'Figma', category: 'Design', aliases: ['Figma Design'], weight: 1.8 },
  { name: 'Adobe XD', category: 'Design', aliases: ['XD', 'Experience Design'], weight: 1.4 },
  { name: 'Sketch', category: 'Design', aliases: ['Sketch App'], weight: 1.3 },
  { name: 'UI/UX Design', category: 'Design', aliases: ['UI Design', 'UX Design', 'User Interface', 'User Experience'], weight: 1.9 },
  { name: 'Adobe Photoshop', category: 'Design', aliases: ['Photoshop', 'PS'], weight: 1.3 },
  { name: 'Adobe Illustrator', category: 'Design', aliases: ['Illustrator', 'AI'], weight: 1.2 },
  { name: 'Design Systems', category: 'Design', aliases: ['Component Library', 'Style Guide'], weight: 1.5 },
  { name: 'Wireframing', category: 'Design', aliases: ['Wireframes', 'Low Fidelity Design'], weight: 1.3 },
  { name: 'Prototyping', category: 'Design', aliases: ['Interactive Prototyping', 'High Fidelity Mockups'], weight: 1.4 },
  { name: 'Responsive Design', category: 'Design', aliases: ['Mobile-First Design', 'Adaptive Design'], weight: 1.6 },

  // ── Other ───────────────────────────────────────────────────────────────
  { name: 'Data Structures', category: 'Other', aliases: ['DSA', 'Data Structures and Algorithms'], weight: 2.0 },
  { name: 'Algorithms', category: 'Other', aliases: ['Algorithm Design', 'Algorithmic Thinking'], weight: 2.0 },
  { name: 'System Design', category: 'Other', aliases: ['Systems Architecture', 'System Architecture', 'Distributed Systems'], weight: 2.3 },
  { name: 'Microservices', category: 'Other', aliases: ['Microservice Architecture', 'MSA'], weight: 2.0 },
  { name: 'OAuth', category: 'Other', aliases: ['OAuth 2.0', 'OpenID Connect', 'OIDC'], weight: 1.4 },
  { name: 'WebSockets', category: 'Other', aliases: ['Web Sockets', 'Socket.io', 'WS'], weight: 1.3 },
  { name: 'API Design', category: 'Other', aliases: ['API Architecture', 'API Development'], weight: 1.7 },
  { name: 'Security', category: 'Other', aliases: ['Cybersecurity', 'Application Security', 'InfoSec'], weight: 1.8 },
  { name: 'Blockchain', category: 'Other', aliases: ['Web3', 'Solidity', 'Smart Contracts'], weight: 1.3 },
  { name: 'Technical Writing', category: 'Other', aliases: ['Documentation', 'Tech Writing'], weight: 1.2 },
  { name: 'DevOps Culture', category: 'Other', aliases: ['SRE', 'Site Reliability Engineering'], weight: 1.5 },
  { name: 'Performance Optimization', category: 'Other', aliases: ['Web Performance', 'Optimization', 'Perf Tuning'], weight: 1.6 },
];

// ---------------------------------------------------------------------------
// Job Roles Data
// ---------------------------------------------------------------------------
const jobRolesData = [
  {
    title: 'Senior Full-Stack Engineer',
    description: 'Design, build, and maintain scalable web applications across the entire stack. Collaborate with product, design, and engineering teams to deliver high-quality features.',
    department: 'Engineering',
    experienceLevel: 'senior',
    skills: [
      { name: 'JavaScript', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'TypeScript', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'React', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Node.js', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'PostgreSQL', level: 'intermediate', weight: 2.0, isRequired: true },
      { name: 'Docker', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'AWS', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Git', level: 'advanced', weight: 1.5, isRequired: true },
      { name: 'REST API', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'System Design', level: 'intermediate', weight: 2.0, isRequired: false },
    ],
  },
  {
    title: 'Frontend Developer',
    description: 'Build responsive, accessible, and performant user interfaces. Work closely with designers and backend engineers to create seamless user experiences.',
    department: 'Engineering',
    experienceLevel: 'mid',
    skills: [
      { name: 'JavaScript', level: 'advanced', weight: 3.0, isRequired: true },
      { name: 'TypeScript', level: 'intermediate', weight: 2.0, isRequired: true },
      { name: 'React', level: 'advanced', weight: 3.0, isRequired: true },
      { name: 'Next.js', level: 'intermediate', weight: 2.0, isRequired: false },
      { name: 'Tailwind CSS', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Jest', level: 'intermediate', weight: 1.5, isRequired: true },
      { name: 'Git', level: 'intermediate', weight: 1.5, isRequired: true },
      { name: 'Responsive Design', level: 'advanced', weight: 2.0, isRequired: true },
    ],
  },
  {
    title: 'Backend Engineer',
    description: 'Architect and develop robust server-side systems, RESTful APIs, and microservices. Ensure high availability, security, and performance of backend services.',
    department: 'Engineering',
    experienceLevel: 'mid',
    skills: [
      { name: 'Python', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Django', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'PostgreSQL', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Redis', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Docker', level: 'intermediate', weight: 2.0, isRequired: true },
      { name: 'REST API', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Git', level: 'intermediate', weight: 1.5, isRequired: true },
      { name: 'Linux', level: 'intermediate', weight: 1.5, isRequired: false },
    ],
  },
  {
    title: 'Data Scientist',
    description: 'Apply statistical analysis, machine learning, and data visualization techniques to extract actionable insights from complex datasets and drive data-informed decisions.',
    department: 'Data',
    experienceLevel: 'mid',
    skills: [
      { name: 'Python', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'Pandas', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'scikit-learn', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'TensorFlow', level: 'intermediate', weight: 2.0, isRequired: false },
      { name: 'SQL', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'NumPy', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Data Visualization', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Deep Learning', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'NLP', level: 'intermediate', weight: 1.5, isRequired: false },
    ],
  },
  {
    title: 'DevOps Engineer',
    description: 'Design, implement, and manage CI/CD pipelines, cloud infrastructure, and container orchestration. Ensure reliability, scalability, and security of production environments.',
    department: 'Infrastructure',
    experienceLevel: 'senior',
    skills: [
      { name: 'AWS', level: 'advanced', weight: 3.0, isRequired: true },
      { name: 'Docker', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'Kubernetes', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Terraform', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'CI/CD', level: 'expert', weight: 2.5, isRequired: true },
      { name: 'Linux', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Python', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Prometheus', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Grafana', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Shell Scripting', level: 'advanced', weight: 2.0, isRequired: true },
    ],
  },
  {
    title: 'Mobile Developer',
    description: 'Develop and maintain cross-platform mobile applications with a focus on performance, usability, and native look and feel across iOS and Android.',
    department: 'Engineering',
    experienceLevel: 'mid',
    skills: [
      { name: 'React Native', level: 'advanced', weight: 3.0, isRequired: true },
      { name: 'JavaScript', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'TypeScript', level: 'intermediate', weight: 2.0, isRequired: true },
      { name: 'iOS Development', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Android Development', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'Jest', level: 'intermediate', weight: 1.5, isRequired: true },
      { name: 'Git', level: 'intermediate', weight: 1.5, isRequired: true },
      { name: 'REST API', level: 'intermediate', weight: 1.5, isRequired: true },
    ],
  },
  {
    title: 'Machine Learning Engineer',
    description: 'Build and deploy production-ready ML models and pipelines. Bridge the gap between data science research and scalable engineering systems.',
    department: 'Data',
    experienceLevel: 'senior',
    skills: [
      { name: 'Python', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'TensorFlow', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'PyTorch', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Docker', level: 'intermediate', weight: 2.0, isRequired: true },
      { name: 'AWS', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'MLOps', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Deep Learning', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'LLMs', level: 'intermediate', weight: 2.0, isRequired: false },
      { name: 'Kubernetes', level: 'intermediate', weight: 1.5, isRequired: false },
      { name: 'scikit-learn', level: 'advanced', weight: 2.0, isRequired: true },
    ],
  },
  {
    title: 'QA Automation Engineer',
    description: 'Design and implement comprehensive automated testing strategies covering unit, integration, and end-to-end tests. Ensure software quality throughout the development lifecycle.',
    department: 'Engineering',
    experienceLevel: 'mid',
    skills: [
      { name: 'JavaScript', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Cypress', level: 'advanced', weight: 3.0, isRequired: true },
      { name: 'Playwright', level: 'advanced', weight: 2.5, isRequired: false },
      { name: 'Selenium', level: 'intermediate', weight: 2.0, isRequired: false },
      { name: 'Jest', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Postman', level: 'intermediate', weight: 1.5, isRequired: true },
      { name: 'Git', level: 'intermediate', weight: 1.5, isRequired: true },
      { name: 'CI/CD', level: 'intermediate', weight: 2.0, isRequired: true },
    ],
  },
  {
    title: 'UI/UX Designer',
    description: 'Create intuitive, visually compelling designs and user experiences. Conduct user research, build prototypes, and maintain design systems to elevate the product.',
    department: 'Design',
    experienceLevel: 'mid',
    skills: [
      { name: 'Figma', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'UI/UX Design', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'Prototyping', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Wireframing', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Design Systems', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Adobe Photoshop', level: 'intermediate', weight: 1.0, isRequired: false },
      { name: 'Responsive Design', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Communication', level: 'advanced', weight: 1.5, isRequired: true },
    ],
  },
  {
    title: 'Cloud Solutions Architect',
    description: 'Design enterprise-scale cloud architectures across multi-cloud environments. Provide technical leadership on cloud migration strategies, cost optimization, and security compliance.',
    department: 'Infrastructure',
    experienceLevel: 'lead',
    skills: [
      { name: 'AWS', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'Azure', level: 'advanced', weight: 2.5, isRequired: false },
      { name: 'GCP', level: 'intermediate', weight: 2.0, isRequired: false },
      { name: 'Terraform', level: 'expert', weight: 2.5, isRequired: true },
      { name: 'Kubernetes', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'System Design', level: 'expert', weight: 3.0, isRequired: true },
      { name: 'Microservices', level: 'advanced', weight: 2.5, isRequired: true },
      { name: 'Security', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Docker', level: 'advanced', weight: 2.0, isRequired: true },
      { name: 'Serverless', level: 'advanced', weight: 2.0, isRequired: false },
      { name: 'Leadership', level: 'advanced', weight: 1.5, isRequired: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Courses Data
// ---------------------------------------------------------------------------
const coursesData = [
  {
    title: 'The Complete JavaScript Course 2025: From Zero to Expert',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/the-complete-javascript-course/',
    description: 'Master JavaScript with the most comprehensive course. Projects, challenges, quizzes, ES6+, OOP, async JS, and more.',
    skillNames: ['JavaScript'],
    duration: '69 hours',
    level: 'beginner',
    rating: 4.7,
    isFree: false,
  },
  {
    title: 'React - The Complete Guide (incl. Next.js, Redux)',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/react-the-complete-guide/',
    description: 'Dive in and learn React.js from scratch. Learn React, Hooks, Redux, React Router, Next.js, and way more.',
    skillNames: ['React', 'Next.js', 'JavaScript'],
    duration: '68 hours',
    level: 'beginner',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Machine Learning Specialization',
    provider: 'Coursera',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    description: 'Build ML models with NumPy and scikit-learn, train neural networks with TensorFlow. By Andrew Ng and Stanford University.',
    skillNames: ['Python', 'scikit-learn', 'TensorFlow', 'NumPy', 'Deep Learning'],
    duration: '3 months',
    level: 'intermediate',
    rating: 4.9,
    isFree: false,
  },
  {
    title: 'AWS Certified Solutions Architect - Associate',
    provider: 'Coursera',
    url: 'https://www.coursera.org/professional-certificates/aws-cloud-solutions-architect',
    description: 'Prepare for the AWS Solutions Architect Associate certification. Learn to design distributed systems on AWS.',
    skillNames: ['AWS', 'System Design', 'Serverless'],
    duration: '6 months',
    level: 'intermediate',
    rating: 4.7,
    isFree: false,
  },
  {
    title: 'Docker and Kubernetes: The Complete Guide',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/',
    description: 'Build, test, and deploy Docker applications with Kubernetes. Master the container ecosystem end to end.',
    skillNames: ['Docker', 'Kubernetes', 'CI/CD'],
    duration: '22 hours',
    level: 'intermediate',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Python for Data Science and Machine Learning Bootcamp',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/',
    description: 'Learn how to use NumPy, Pandas, Seaborn, Matplotlib, scikit-learn, TensorFlow, and more for data science.',
    skillNames: ['Python', 'Pandas', 'NumPy', 'scikit-learn', 'Data Visualization'],
    duration: '25 hours',
    level: 'beginner',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Angular - The Complete Guide',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/the-complete-guide-to-angular-2/',
    description: 'Master Angular and build awesome, reactive web apps. Covers Angular 17+, RxJS, NgRx, and TypeScript.',
    skillNames: ['Angular', 'TypeScript'],
    duration: '37 hours',
    level: 'beginner',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/',
    description: 'Master Node.js by building a RESTful API and web app with authentication, security, payments, and more.',
    skillNames: ['Node.js', 'Express.js', 'MongoDB'],
    duration: '42 hours',
    level: 'beginner',
    rating: 4.7,
    isFree: false,
  },
  {
    title: 'Responsive Web Design Certification',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
    description: 'Learn HTML, CSS, and responsive web design by building 20 projects. Earn a free verified certification.',
    skillNames: ['Responsive Design', 'Tailwind CSS'],
    duration: '300 hours',
    level: 'beginner',
    rating: 4.8,
    isFree: true,
  },
  {
    title: 'JavaScript Algorithms and Data Structures',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
    description: 'Learn fundamental programming concepts with JavaScript. Build projects covering regex, debugging, data structures, and algorithms.',
    skillNames: ['JavaScript', 'Data Structures', 'Algorithms'],
    duration: '300 hours',
    level: 'intermediate',
    rating: 4.8,
    isFree: true,
  },
  {
    title: 'C# Path',
    provider: 'Pluralsight',
    url: 'https://www.pluralsight.com/paths/csharp',
    description: 'Master C# from fundamentals to advanced concepts including LINQ, async programming, and .NET development.',
    skillNames: ['C#', '.NET'],
    duration: '40 hours',
    level: 'beginner',
    rating: 4.5,
    isFree: false,
  },
  {
    title: 'React Native - The Practical Guide',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/react-native-the-practical-guide/',
    description: 'Build native mobile apps for iOS and Android using React Native and Expo. Learn navigation, state management, and device features.',
    skillNames: ['React Native', 'JavaScript', 'TypeScript'],
    duration: '29 hours',
    level: 'intermediate',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Deep Learning Specialization',
    provider: 'Coursera',
    url: 'https://www.coursera.org/specializations/deep-learning',
    description: 'Master deep learning by Andrew Ng. Build CNNs, RNNs, LSTMs, Transformers. Work on real-world speech recognition, NLP, and more.',
    skillNames: ['Deep Learning', 'TensorFlow', 'NLP', 'Computer Vision', 'Python'],
    duration: '5 months',
    level: 'advanced',
    rating: 4.9,
    isFree: false,
  },
  {
    title: 'Terraform on AWS - The Complete Guide',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/terraform-on-aws-the-complete-guide/',
    description: 'Learn Infrastructure as Code with Terraform on AWS. Build VPCs, ECS, EKS, RDS, and more from scratch.',
    skillNames: ['Terraform', 'AWS'],
    duration: '18 hours',
    level: 'intermediate',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Testing JavaScript with Jest and Cypress',
    provider: 'Pluralsight',
    url: 'https://www.pluralsight.com/courses/testing-javascript',
    description: 'Comprehensive guide to testing JavaScript applications. Covers unit testing with Jest, E2E testing with Cypress, and CI integration.',
    skillNames: ['Jest', 'Cypress', 'JavaScript'],
    duration: '12 hours',
    level: 'intermediate',
    rating: 4.5,
    isFree: false,
  },
  {
    title: 'Flutter & Dart - The Complete Guide',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/learn-flutter-dart-to-build-ios-android-apps/',
    description: 'Build beautiful iOS and Android apps with Flutter and Dart. Learn widgets, state management, Firebase integration, and more.',
    skillNames: ['Flutter', 'Dart', 'Firebase'],
    duration: '42 hours',
    level: 'beginner',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Spring Boot 3 & Spring Framework 6',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/spring-hibernate-tutorial/',
    description: 'Master Spring Boot 3, Spring Framework 6, Hibernate, REST APIs, Spring Security, and microservices architecture.',
    skillNames: ['Spring Boot', 'Java', 'Microservices', 'REST API'],
    duration: '53 hours',
    level: 'intermediate',
    rating: 4.6,
    isFree: false,
  },
  {
    title: 'Git & GitHub - The Complete Guide',
    provider: 'Udemy',
    url: 'https://www.udemy.com/course/git-github-practical-guide/',
    description: 'Master Git and GitHub from basics to advanced topics. Learn branching strategies, rebasing, cherry-picking, and team workflows.',
    skillNames: ['Git', 'GitHub'],
    duration: '16 hours',
    level: 'beginner',
    rating: 4.7,
    isFree: false,
  },
  {
    title: 'APIs and Microservices Certification',
    provider: 'freeCodeCamp',
    url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/',
    description: 'Learn Node.js, Express.js, and MongoDB. Build APIs, microservices, and work with databases. Free certification.',
    skillNames: ['Node.js', 'Express.js', 'MongoDB', 'REST API'],
    duration: '300 hours',
    level: 'intermediate',
    rating: 4.7,
    isFree: true,
  },
  {
    title: 'Google UX Design Professional Certificate',
    provider: 'Coursera',
    url: 'https://www.coursera.org/professional-certificates/google-ux-design',
    description: 'Design user experiences for products. Learn the foundations of UX, including research, wireframing, prototyping, and usability testing.',
    skillNames: ['UI/UX Design', 'Figma', 'Wireframing', 'Prototyping'],
    duration: '6 months',
    level: 'beginner',
    rating: 4.8,
    isFree: false,
  },
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
const seed = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB. Starting seed...\n');

    // ── Step 1: Clear existing data ───────────────────────────────────────
    console.log('Clearing existing data...');
    await Promise.all([
      Skill.deleteMany({}),
      JobRole.deleteMany({}),
      Course.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('All existing data cleared.\n');

    // ── Step 2: Seed Skills ───────────────────────────────────────────────
    console.log('Seeding skills...');
    const insertedSkills = await Skill.insertMany(skillsData);
    console.log(`  Inserted ${insertedSkills.length} skills.`);

    // Build a lookup map: skill name -> ObjectId
    const skillMap = {};
    for (const skill of insertedSkills) {
      skillMap[skill.name] = skill._id;
    }

    // ── Step 3: Seed Job Roles ────────────────────────────────────────────
    console.log('Seeding job roles...');
    const jobRoleDocs = jobRolesData.map((role) => {
      const requiredSkills = role.skills
        .map((s) => {
          const skillId = skillMap[s.name];
          if (!skillId) {
            console.warn(`  WARNING: Skill "${s.name}" not found for job role "${role.title}". Skipping.`);
            return null;
          }
          return {
            skill: skillId,
            level: s.level,
            weight: s.weight,
            isRequired: s.isRequired,
          };
        })
        .filter(Boolean);

      return {
        title: role.title,
        description: role.description,
        department: role.department,
        requiredSkills,
        experienceLevel: role.experienceLevel,
        isActive: true,
      };
    });

    const insertedRoles = await JobRole.insertMany(jobRoleDocs);
    console.log(`  Inserted ${insertedRoles.length} job roles.`);

    // ── Step 4: Seed Courses ──────────────────────────────────────────────
    console.log('Seeding courses...');
    const courseDocs = coursesData.map((course) => {
      const skills = course.skillNames
        .map((name) => {
          const skillId = skillMap[name];
          if (!skillId) {
            console.warn(`  WARNING: Skill "${name}" not found for course "${course.title}". Skipping.`);
            return null;
          }
          return skillId;
        })
        .filter(Boolean);

      return {
        title: course.title,
        provider: course.provider,
        url: course.url,
        description: course.description,
        skills,
        duration: course.duration,
        level: course.level,
        rating: course.rating,
        isFree: course.isFree,
        isActive: true,
      };
    });

    const insertedCourses = await Course.insertMany(courseDocs);
    console.log(`  Inserted ${insertedCourses.length} courses.`);

    // ── Step 5: Seed Admin User ───────────────────────────────────────────
    console.log('Seeding admin user...');
    const adminUser = await User.create({
      name: 'SmartHire Admin',
      email: 'admin@smarthire.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
    });
    console.log(`  Created admin user: ${adminUser.email}`);

    // ── Summary ───────────────────────────────────────────────────────────
    console.log('\n========================================');
    console.log('  Database seeding completed!');
    console.log('========================================');
    console.log(`  Skills:    ${insertedSkills.length}`);
    console.log(`  Job Roles: ${insertedRoles.length}`);
    console.log(`  Courses:   ${insertedCourses.length}`);
    console.log(`  Users:     1 (admin@smarthire.com)`);
    console.log('========================================\n');

    // Print category breakdown
    const categoryCounts = {};
    for (const skill of insertedSkills) {
      categoryCounts[skill.category] = (categoryCounts[skill.category] || 0) + 1;
    }
    console.log('Skills breakdown by category:');
    for (const [category, count] of Object.entries(categoryCounts).sort()) {
      console.log(`  ${category}: ${count}`);
    }
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

// Run the seed
seed();
