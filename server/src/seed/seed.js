require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    console.log('[Seed] Clearing existing database collections...');

    await User.deleteMany();
    await Course.deleteMany();
    await Enrollment.deleteMany();

    console.log('[Seed] Creating demo users...');
    // Passwords will be hashed automatically by the User pre-save hook
    const users = await User.create([
      {
        name: 'ICTAK Administrator',
        email: 'admin@ictkerala.org',
        password: 'Admin@123',
        role: 'admin',
        department: 'Operations',
        phone: '+91 94000 11000',
      },
      {
        name: 'Prof. Priya Nair',
        email: 'priya.nair@ictkerala.org',
        password: 'Trainer@123',
        role: 'instructor',
        department: 'Full Stack Development',
        phone: '+91 94000 22000',
      },
      {
        name: 'Dr. Arun Thomas',
        email: 'arun.thomas@ictkerala.org',
        password: 'Trainer@123',
        role: 'instructor',
        department: 'Data Science & AI',
        phone: '+91 94000 33000',
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul.kumar@gmail.com',
        password: 'Student@123',
        role: 'student',
        department: 'Computer Science',
        phone: '+91 98000 44000',
      },
      {
        name: 'Ananya Sen',
        email: 'ananya.sen@gmail.com',
        password: 'Student@123',
        role: 'student',
        department: 'Information Technology',
        phone: '+91 98000 55000',
      },
      {
        name: 'Mohammed Ali',
        email: 'mohammed.ali@gmail.com',
        password: 'Student@123',
        role: 'student',
        department: 'Electronics',
        phone: '+91 98000 66000',
      },
    ]);

    const admin = users[0];
    const priya = users[1];
    const arun = users[2];
    const rahul = users[3];
    const ananya = users[4];
    const mohammed = users[5];

    console.log('[Seed] Creating demo courses...');
    const courses = await Course.create([
      {
        title: 'Full Stack MERN Web Development',
        code: 'ICT-FS101',
        description: 'Comprehensive industry-aligned course covering MongoDB data modeling, Express REST APIs, React dynamic UI with Vite, and scalable Node.js microservices.',
        department: 'Full Stack Development',
        instructor: priya._id,
        credits: 4,
        maxCapacity: 35,
        level: 'Intermediate',
        modules: [
          { title: 'MongoDB & Schema Architecture', durationHours: 15, description: 'Mongoose ODM, compound indexing, aggregation pipelines.' },
          { title: 'RESTful API Engineering with Express', durationHours: 25, description: 'Middleware, JWT authentication, and centralized error handling.' },
          { title: 'React 19 & State Management', durationHours: 35, description: 'Component lifecycles, hooks, context API, and responsive UI design.' },
          { title: 'Cloud Deployment & DevOps', durationHours: 15, description: 'Continuous deployment on Render and Vercel with HTTPS.' },
        ],
        status: 'active',
      },
      {
        title: 'Python for Data Science & Machine Learning',
        code: 'ICT-DS201',
        description: 'Master data analysis, exploratory statistical computing, and predictive modeling using Python, NumPy, Pandas, and Scikit-Learn.',
        department: 'Data Science & AI',
        instructor: arun._id,
        credits: 4,
        maxCapacity: 30,
        level: 'Beginner',
        modules: [
          { title: 'Python Foundations for Scientific Computing', durationHours: 15, description: 'Vectorized computing with NumPy.' },
          { title: 'Data Wrangling with Pandas', durationHours: 20, description: 'Cleaning, merging, and grouping complex tabular datasets.' },
          { title: 'Machine Learning Models', durationHours: 30, description: 'Supervised classification and regression algorithms.' },
        ],
        status: 'active',
      },
      {
        title: 'Cyber Security Operations & Network Defense',
        code: 'ICT-CS301',
        description: 'Practical training on vulnerability assessment, OWASP Top 10 web security, cryptographic principles, and network intrusion prevention.',
        department: 'Cyber Security',
        instructor: arun._id,
        credits: 3,
        maxCapacity: 25,
        level: 'Advanced',
        modules: [
          { title: 'Network Security Fundamentals', durationHours: 20, description: 'TCP/IP vulnerabilities and packet analysis.' },
          { title: 'Web Application Security & OWASP', durationHours: 25, description: 'Preventing SQL/NoSQL injection and XSS.' },
        ],
        status: 'active',
      },
      {
        title: 'Cloud Native Solutions Architecture with AWS & Docker',
        code: 'ICT-CC401',
        description: 'Design and deploy resilient, containerized multi-tier cloud applications on Amazon Web Services utilizing Docker and CI/CD pipelines.',
        department: 'Cloud Computing',
        instructor: priya._id,
        credits: 3,
        maxCapacity: 40,
        level: 'Intermediate',
        modules: [
          { title: 'Docker Containerization', durationHours: 20, description: 'Multi-stage builds and container orchestration.' },
          { title: 'AWS Cloud Infrastructure', durationHours: 25, description: 'EC2, S3, RDS, VPCs, and serverless architectures.' },
        ],
        status: 'active',
      },
    ]);

    console.log('[Seed] Creating demo enrollments & academic grades...');
    await Enrollment.create([
      {
        student: rahul._id,
        course: courses[0]._id, // MERN
        status: 'in-progress',
        grade: 'A',
        score: 91,
        feedback: 'Outstanding milestone progress and clean React code architecture.',
      },
      {
        student: rahul._id,
        course: courses[1]._id, // Data Science
        status: 'completed',
        grade: 'A+',
        score: 96,
        feedback: 'Exemplary project work and thorough data analysis reports.',
      },
      {
        student: ananya._id,
        course: courses[0]._id, // MERN
        status: 'enrolled',
        grade: 'Pending',
        score: null,
        feedback: 'Recently enrolled; active in class sessions.',
      },
      {
        student: ananya._id,
        course: courses[2]._id, // Cyber Security
        status: 'in-progress',
        grade: 'B',
        score: 84,
        feedback: 'Solid understanding of network packet inspection.',
      },
      {
        student: mohammed._id,
        course: courses[3]._id, // Cloud Native
        status: 'completed',
        grade: 'A',
        score: 89,
        feedback: 'Successfully deployed automated container pipelines.',
      },
    ]);

    console.log('[Seed] Database successfully populated with initial ICTAK academic data!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error populating database:', error);
    if (require.main === module) {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
