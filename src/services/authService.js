/**
 * Authentication Service
 * Contains all database operations and business logic related to authentication
 */

import prisma from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export class AuthService {
  /**
   * Create a new user in the database
   * @param {Object} userData - User data to create
   * @param {string} userData.name - User's name
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password (will be hashed)
   * @returns {Promise<Object>} Created user without password
   * @throws {Error} If email already exists or database error occurs
   */
  static async createUser(userData) {
    const { name, email, password } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Este email já está em uso');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        favorites: true,
        responseStyle: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse favorites to array (will be null for new users)
    user.favorites = user.favorites ? JSON.parse(user.favorites) : [];

    return user;
  }

  /**
   * Authenticate user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} User data without password
   * @throws {Error} If credentials are invalid
   */
  static async authenticateUser(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Credenciais inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    
    // Parse favorites to array
    if (userWithoutPassword.favorites) {
      try {
        userWithoutPassword.favorites = JSON.parse(userWithoutPassword.favorites);
      } catch (error) {
        userWithoutPassword.favorites = [];
      }
    } else {
      userWithoutPassword.favorites = [];
    }
    
    return userWithoutPassword;
  }

  /**
   * Find user by ID
   * @param {string} userId - User's ID
   * @returns {Promise<Object|null>} User data without password or null if not found
   */
  static async findUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        favorites: true,
        responseStyle: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Parse favorites to array if user exists
    if (user && user.favorites) {
      try {
        user.favorites = JSON.parse(user.favorites);
      } catch (error) {
        user.favorites = [];
      }
    } else if (user) {
      user.favorites = [];
    }

    return user;
  }

  /**
   * Check if user exists by email
   * @param {string} email - User's email
   * @returns {Promise<boolean>} True if user exists, false otherwise
   */
  static async userExistsByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return !!user;
  }
}