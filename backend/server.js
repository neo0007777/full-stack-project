const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const allowedOrigins =
  (process.env.CLIENT_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
  })
);
app.use(express.json());

mongoose.set('strictQuery', true);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 64 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);

const createToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Missing authorization token' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

app.post('/api/auth/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: 'Account already exists. Please sign in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user);
    return res.status(201).json({ token, user: user.toJSON() });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'Account not found. Please sign up first.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = createToken(user);
    return res.json({ token, user: user.toJSON() });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  return res.json({ user: req.user });
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  return res.json({ message: 'Successfully logged out' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.get('/', (_req, res) => {
  res.json({ status: 'OK', message: 'Auth API is running' });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong. Please try again later.' });
});

let inMemoryMongo = null;

const resolveMongoUri = async () => {
  if (process.env.MONGODB_URI) {
    return process.env.MONGODB_URI;
  }
  if (!inMemoryMongo) {
    inMemoryMongo = await MongoMemoryServer.create();
    console.warn(
      'MONGODB_URI not found. Booting temporary in-memory MongoDB instance for local use.'
    );
  }
  return inMemoryMongo.getUri();
};

const startServer = async () => {
  try {
    const mongoUri = await resolveMongoUri();
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

startServer();

const gracefulShutdown = async () => {
  await mongoose.connection.close();
  if (inMemoryMongo) {
    await inMemoryMongo.stop();
  }
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

