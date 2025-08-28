const bcrypt = require('bcryptjs');

// Seed Users
const seedUsers = [
  {
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    password: "password123",
    role: "admin",
    bio: "Full-stack developer with 5+ years experience in web development. Passionate about AI and machine learning.",
    skills: ["JavaScript", "React", "Node.js", "Python", "MongoDB", "AI/ML"],
    experience: "advanced",
    github: "https://github.com/alexjohnson",
    linkedin: "https://linkedin.com/in/alexjohnson",
    portfolio: "https://alexjohnson.dev",
    personalityType: "leader",
    workStyle: "fullstack",
    availability: "full-time",
    location: "San Francisco, CA"
  },
  {
    name: "Sarah Chen",
    email: "sarah.chen@example.com",
    password: "password123",
    role: "user",
    bio: "Frontend developer and UI/UX designer. Love creating beautiful and intuitive user experiences.",
    skills: ["React", "Vue.js", "CSS", "Figma", "TypeScript", "Design Systems"],
    experience: "intermediate",
    github: "https://github.com/sarahchen",
    linkedin: "https://linkedin.com/in/sarahchen",
    portfolio: "https://sarahchen.design",
    personalityType: "innovator",
    workStyle: "frontend",
    availability: "part-time",
    location: "New York, NY"
  },
  {
    name: "Mike Rodriguez",
    email: "mike.rodriguez@example.com",
    password: "password123",
    role: "user",
    bio: "Backend engineer specializing in scalable systems and cloud architecture.",
    skills: ["Java", "Spring Boot", "AWS", "Docker", "Kubernetes", "PostgreSQL"],
    experience: "advanced",
    github: "https://github.com/mikerodriguez",
    linkedin: "https://linkedin.com/in/mikerodriguez",
    personalityType: "executor",
    workStyle: "backend",
    availability: "weekends",
    location: "Austin, TX"
  },
  {
    name: "Emma Wilson",
    email: "emma.wilson@example.com",
    password: "password123",
    role: "user",
    bio: "Data scientist and machine learning enthusiast. Currently pursuing PhD in Computer Science.",
    skills: ["Python", "TensorFlow", "PyTorch", "R", "SQL", "Data Visualization"],
    experience: "intermediate",
    github: "https://github.com/emmawilson",
    linkedin: "https://linkedin.com/in/emmawilson",
    personalityType: "analyst",
    workStyle: "data",
    availability: "part-time",
    location: "Boston, MA"
  },
  {
    name: "David Kim",
    email: "david.kim@example.com",
    password: "password123",
    role: "user",
    bio: "Mobile app developer with expertise in both iOS and Android platforms.",
    skills: ["Swift", "Kotlin", "React Native", "Flutter", "Firebase", "Mobile UI/UX"],
    experience: "intermediate",
    github: "https://github.com/davidkim",
    linkedin: "https://linkedin.com/in/davidkim",
    personalityType: "collaborator",
    workStyle: "mobile",
    availability: "full-time",
    location: "Seattle, WA"
  }
];

// Seed Hackathons
const seedHackathons = [
  {
    title: "AI Innovation Challenge 2025",
    description: "Build innovative AI solutions that solve real-world problems. Focus on machine learning, natural language processing, and computer vision applications.",
    organizer: "TechCorp Inc.",
    startDate: new Date('2025-03-15'),
    endDate: new Date('2025-03-17'),
    registrationDeadline: new Date('2025-03-10'),
    location: "hybrid",
    venue: "TechCorp Campus, San Francisco",
    maxParticipants: 500,
    themes: ["Artificial Intelligence", "Machine Learning", "Healthcare", "Education"],
    prizes: [
      { position: "1st Place", amount: "$10,000", description: "Grand Prize Winner" },
      { position: "2nd Place", amount: "$5,000", description: "Runner Up" },
      { position: "3rd Place", amount: "$2,500", description: "Third Place" }
    ],
    rules: "Teams of 2-5 members. Original code only. 48-hour development window.",
    requirements: ["Laptop", "GitHub Account", "Presentation Skills"],
    tags: ["AI", "ML", "Innovation", "Tech"],
    difficulty: "intermediate",
    website: "https://techcorp.com/hackathon",
    contactEmail: "hackathon@techcorp.com",
    status: "upcoming"
  },
  {
    title: "Green Tech Hackathon",
    description: "Create sustainable technology solutions for environmental challenges. Focus on clean energy, waste reduction, and climate change mitigation.",
    organizer: "EcoTech Foundation",
    startDate: new Date('2025-04-20'),
    endDate: new Date('2025-04-22'),
    registrationDeadline: new Date('2025-04-15'),
    location: "online",
    maxParticipants: 300,
    themes: ["Sustainability", "Clean Energy", "Environment", "Climate Change"],
    prizes: [
      { position: "1st Place", amount: "$8,000", description: "Best Green Solution" },
      { position: "2nd Place", amount: "$4,000", description: "Most Innovative" },
      { position: "People's Choice", amount: "$2,000", description: "Community Favorite" }
    ],
    rules: "Open to all skill levels. Focus on environmental impact. Must include sustainability metrics.",
    requirements: ["Internet Connection", "Development Environment"],
    tags: ["Green", "Sustainability", "Environment", "Innovation"],
    difficulty: "all-levels",
    website: "https://ecotech.org/hackathon",
    contactEmail: "green@ecotech.org",
    status: "upcoming"
  },
  {
    title: "FinTech Innovation Sprint",
    description: "Revolutionize financial services with cutting-edge technology. Build solutions for banking, payments, investments, and financial inclusion.",
    organizer: "FinTech Alliance",
    startDate: new Date('2025-05-10'),
    endDate: new Date('2025-05-12'),
    registrationDeadline: new Date('2025-05-05'),
    location: "in-person",
    venue: "Financial District, New York",
    maxParticipants: 200,
    themes: ["Financial Technology", "Blockchain", "Digital Payments", "Investment Tech"],
    prizes: [
      { position: "1st Place", amount: "$15,000", description: "Best FinTech Solution" },
      { position: "2nd Place", amount: "$7,500", description: "Most Scalable" },
      { position: "3rd Place", amount: "$3,500", description: "Best User Experience" }
    ],
    rules: "Teams of 3-6 members. Must comply with financial regulations. Real-world applicability required.",
    requirements: ["Financial Domain Knowledge", "Development Skills", "Pitch Deck"],
    tags: ["FinTech", "Blockchain", "Payments", "Banking"],
    difficulty: "advanced",
    website: "https://fintechalliance.com/hackathon",
    contactEmail: "hackathon@fintechalliance.com",
    status: "upcoming"
  }
];

// Seed Teams
const seedTeams = [
  {
    name: "AI Innovators",
    description: "We're building the next generation of AI-powered healthcare solutions. Looking for passionate developers who want to make a real impact.",
    maxMembers: 5,
    requiredSkills: ["Python", "Machine Learning", "Healthcare Domain"],
    status: "recruiting",
    tags: ["AI", "Healthcare", "Machine Learning", "Innovation"],
    projectIdea: "Developing an AI-powered diagnostic tool that can analyze medical images and provide preliminary assessments to assist healthcare professionals.",
    githubRepo: "https://github.com/ai-innovators/healthcare-ai"
  },
  {
    name: "Green Code Warriors",
    description: "Passionate about sustainability and clean technology. We're creating solutions to combat climate change through innovative software.",
    maxMembers: 4,
    requiredSkills: ["JavaScript", "React", "Environmental Science"],
    status: "recruiting",
    tags: ["Sustainability", "Environment", "Clean Tech", "Climate"],
    projectIdea: "Building a carbon footprint tracking app that gamifies sustainable living and connects users with local green initiatives.",
    githubRepo: "https://github.com/green-warriors/carbon-tracker"
  },
  {
    name: "FinTech Pioneers",
    description: "Experienced team working on revolutionary financial technology solutions. We combine deep financial knowledge with cutting-edge tech.",
    maxMembers: 6,
    requiredSkills: ["Blockchain", "Smart Contracts", "Financial Modeling"],
    status: "full",
    tags: ["FinTech", "Blockchain", "DeFi", "Payments"],
    projectIdea: "Creating a decentralized lending platform that uses AI to assess creditworthiness without traditional credit scores.",
    githubRepo: "https://github.com/fintech-pioneers/defi-lending"
  }
];

// Seed Blogs
const seedBlogs = [
  {
    title: "10 Tips for Winning Your First Hackathon",
    content: `Participating in your first hackathon can be both exciting and overwhelming. Here are 10 essential tips to help you succeed:

1. **Choose the Right Team**: Look for teammates with complementary skills. A good team typically includes developers, designers, and someone with business acumen.

2. **Start with a Simple Idea**: Don't try to build the next Facebook in 48 hours. Focus on a simple, well-executed solution to a specific problem.

3. **Plan Your Time Wisely**: Spend the first few hours planning and the last few hours polishing your presentation. Don't code until the last minute.

4. **Focus on the MVP**: Build a Minimum Viable Product that demonstrates your core concept. It's better to have a working simple solution than a broken complex one.

5. **Practice Your Pitch**: Judges often have limited time. Prepare a clear, concise presentation that explains your problem, solution, and impact.

6. **Use Familiar Technologies**: Hackathons aren't the time to learn new frameworks. Stick with technologies you know well.

7. **Document Everything**: Keep track of your progress, challenges, and solutions. This helps with your presentation and future reference.

8. **Network and Have Fun**: Hackathons are great networking opportunities. Meet other participants, mentors, and sponsors.

9. **Get Feedback Early**: Show your progress to mentors and other teams. Early feedback can save you from going down the wrong path.

10. **Don't Give Up**: Hackathons are intense, and you'll face challenges. Stay positive and keep pushing forward.

Remember, winning isn't everything. The experience, learning, and connections you make are often more valuable than any prize.`,
    category: "tips",
    tags: ["hackathon", "tips", "beginners", "strategy"],
    readTime: 5,
    status: "published",
    publishedAt: new Date('2025-01-15')
  },
  {
    title: "Building Successful Teams: A Guide for Hackathon Leaders",
    content: `Leading a hackathon team requires a unique blend of technical skills, leadership abilities, and emotional intelligence. Here's how to build and lead a successful team:

**Team Formation**
The key to a successful hackathon team is diversity. Look for:
- Technical skills that complement each other
- Different perspectives and backgrounds
- Shared enthusiasm for the project
- Good communication skills

**Setting Clear Goals**
From the start, establish:
- What you want to build
- Individual roles and responsibilities
- Timeline and milestones
- Success criteria

**Communication is Key**
- Hold regular check-ins (every 4-6 hours)
- Use collaboration tools like Slack or Discord
- Be transparent about challenges and progress
- Encourage open feedback

**Managing Conflicts**
When disagreements arise:
- Listen to all perspectives
- Focus on the project goals
- Make decisions quickly
- Don't let perfect be the enemy of good

**Keeping Morale High**
- Celebrate small wins
- Take breaks together
- Share food and drinks
- Remember to have fun

**Technical Leadership**
- Make architectural decisions early
- Set up development environment and tools
- Ensure code quality and documentation
- Plan for integration and testing

The best hackathon leaders create an environment where everyone can contribute their best work while maintaining team cohesion and momentum.`,
    category: "tutorials",
    tags: ["leadership", "teamwork", "management", "collaboration"],
    readTime: 7,
    status: "published",
    publishedAt: new Date('2025-01-20')
  },
  {
    title: "The Rise of AI in Hackathons: Trends and Opportunities",
    content: `Artificial Intelligence has become a dominant theme in modern hackathons, transforming how participants approach problem-solving and innovation. This shift reflects the growing importance of AI in the tech industry and presents unique opportunities for developers.

**Current AI Trends in Hackathons**

Machine Learning Integration: Teams are increasingly incorporating ML models into their solutions, from simple recommendation systems to complex computer vision applications.

Natural Language Processing: With the rise of large language models, NLP has become more accessible, leading to innovative chatbots, content generation tools, and language translation services.

Computer Vision Applications: Image recognition, object detection, and facial recognition are popular choices for teams working on healthcare, security, and retail solutions.

**Opportunities for Participants**

Learning and Skill Development: Hackathons provide a low-pressure environment to experiment with AI technologies and learn from experienced practitioners.

Real-world Problem Solving: AI enables teams to tackle complex problems that were previously difficult to address in a short timeframe.

Industry Connections: Many AI-focused hackathons are sponsored by tech giants, providing networking opportunities with industry leaders.

**Tips for AI Hackathon Success**

1. Start with pre-trained models rather than building from scratch
2. Focus on data quality and preprocessing
3. Have a backup plan that doesn't rely on AI
4. Clearly explain your AI approach to judges
5. Consider ethical implications of your AI solution

The future of hackathons will likely see even more AI integration, making it essential for participants to develop AI literacy and understanding.`,
    category: "tutorials",
    tags: ["AI", "machine learning", "trends", "technology"],
    readTime: 6,
    status: "published",
    publishedAt: new Date('2025-02-01')
  }
];

// Seed Invitations
const seedInvitations = [
  {
    type: "team-invite",
    message: "Hi! We'd love to have you join our AI Innovators team. Your machine learning expertise would be perfect for our healthcare project!",
    status: "pending"
  },
  {
    type: "team-request",
    message: "Hello! I'm really interested in joining the Green Code Warriors team. I have experience with React and environmental data analysis.",
    status: "pending"
  },
  {
    type: "hackathon-invite",
    message: "You're invited to participate in our exclusive FinTech Innovation Sprint. Your blockchain expertise makes you a perfect fit!",
    status: "accepted",
    respondedAt: new Date('2025-02-10')
  }
];

module.exports = {
  seedUsers,
  seedHackathons,
  seedTeams,
  seedBlogs,
  seedInvitations
};