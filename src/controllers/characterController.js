/**
 * Character Controller
 * Handles CRUD operations for characters
 */

import { sendSuccess, sendError } from '../utils/response.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: Get all active characters
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: List of characters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     characters:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Character'
 */
export const getCharacters = async (req, res, next) => {
  try {
    logger.info('Fetching all active characters');

    const characters = await prisma.character.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        key: true,
        name: true,
        avatarUrl: true,
        styleTags: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { name: 'asc' }
      ]
    });

    logger.info(`Found ${characters.length} active characters`);

    return sendSuccess(res, {
      characters,
      count: characters.length
    }, 'Characters retrieved successfully');

  } catch (error) {
    logger.error('Error in getCharacters:', error);
    next(error);
  }
};

/**
 * @swagger
 * /characters/{key}:
 *   get:
 *     summary: Get character by key
 *     tags: [Characters]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Character retrieved successfully
 *       404:
 *         description: Character not found
 */
export const getCharacterByKey = async (req, res, next) => {
  try {
    const { key } = req.params;

    logger.info(`Fetching character with key: ${key}`);

    const character = await prisma.character.findUnique({
      where: { key },
      select: {
        id: true,
        key: true,
        name: true,
        avatarUrl: true,
        styleTags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!character) {
      throw new NotFoundError('Character');
    }

    if (!character.isActive) {
      throw new NotFoundError('Character');
    }

    return sendSuccess(res, { character }, 'Character retrieved successfully');

  } catch (error) {
    logger.error('Error in getCharacterByKey:', error);
    next(error);
  }
};

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Create new character (Admin only)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCharacter'
 *     responses:
 *       201:
 *         description: Character created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Character key already exists
 */
export const createCharacter = async (req, res, next) => {
  try {
    const { key, name, avatarUrl, basePrompt, styleTags } = req.body;

    logger.info(`Creating character with key: ${key}`);

    // Check if character with this key already exists
    const existingCharacter = await prisma.character.findUnique({
      where: { key }
    });

    if (existingCharacter) {
      throw new ValidationError('Character with this key already exists');
    }

    const character = await prisma.character.create({
      data: {
        key,
        name,
        avatarUrl,
        basePrompt,
        styleTags: styleTags || []
      },
      select: {
        id: true,
        key: true,
        name: true,
        avatarUrl: true,
        styleTags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info(`Character created successfully: ${character.id}`);

    return sendSuccess(res, { character }, 'Character created successfully', 201);

  } catch (error) {
    logger.error('Error in createCharacter:', error);
    next(error);
  }
};

/**
 * @swagger
 * /characters/{key}:
 *   put:
 *     summary: Update character (Admin only)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCharacter'
 *     responses:
 *       200:
 *         description: Character updated successfully
 *       404:
 *         description: Character not found
 */
export const updateCharacter = async (req, res, next) => {
  try {
    const { key } = req.params;
    const updateData = req.body;

    logger.info(`Updating character with key: ${key}`);

    // Check if character exists
    const existingCharacter = await prisma.character.findUnique({
      where: { key }
    });

    if (!existingCharacter) {
      throw new NotFoundError('Character');
    }

    const updatedCharacter = await prisma.character.update({
      where: { key },
      data: updateData,
      select: {
        id: true,
        key: true,
        name: true,
        avatarUrl: true,
        styleTags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    logger.info(`Character updated successfully: ${updatedCharacter.id}`);

    return sendSuccess(res, { character: updatedCharacter }, 'Character updated successfully');

  } catch (error) {
    logger.error('Error in updateCharacter:', error);
    next(error);
  }
};

/**
 * @swagger
 * /characters/{key}:
 *   delete:
 *     summary: Deactivate character (Admin only)
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Character deactivated successfully
 *       404:
 *         description: Character not found
 */
export const deleteCharacter = async (req, res, next) => {
  try {
    const { key } = req.params;

    logger.info(`Deactivating character with key: ${key}`);

    // Check if character exists
    const existingCharacter = await prisma.character.findUnique({
      where: { key }
    });

    if (!existingCharacter) {
      throw new NotFoundError('Character');
    }

    // Soft delete by setting isActive to false
    await prisma.character.update({
      where: { key },
      data: { isActive: false }
    });

    logger.info(`Character deactivated successfully: ${key}`);

    return sendSuccess(res, {}, 'Character deactivated successfully');

  } catch (error) {
    logger.error('Error in deleteCharacter:', error);
    next(error);
  }
};
