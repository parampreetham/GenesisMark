import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './src/firebaseAdmin.js'; // Import our Firestore connection

const router = Router();
const usersRef = db.collection('users');
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Check if user already exists
    const snapshot = await usersRef.where('email', '==', email).get();
    if (!snapshot.empty) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Save the new user to Firestore
    const newUserRef = await usersRef.add({
      email,
      hashedPassword,
    });

    console.log(`New user registered: ${email} (ID: ${newUserRef.id})`);
    res.status(201).json({ message: 'User registered successfully.' });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Log in a user and return a JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // 1. Find the user by email
    const snapshot = await usersRef.where('email', '==', email).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid credentials.' }); // Use "Invalid" for security
    }

    // 2. Get user data
    const userDoc = snapshot.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    // 3. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // 4. Passwords match! Create a JWT
    const payload = {
      user: {
        id: userId,
        email: user.email,
      }
    };

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '3h' } // Token expires in 3 hours
    );

    console.log(`User logged in: ${user.email}`);
    res.json({
      message: 'Login successful.',
      token: token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

export default router;