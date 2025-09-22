const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Register a new citizen
const registerCitizen = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, address, city, postal_code, latitude, longitude } = req.body;

    // Check if user already exists
    const existingUser = await query('SELECT id FROM citizens WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A citizen with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new citizen
    const result = await query(`
      INSERT INTO citizens (email, password_hash, first_name, last_name, phone, address, city, postal_code, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, first_name, last_name, phone, address, city, postal_code, latitude, longitude, role, created_at
    `, [email, passwordHash, first_name, last_name, phone, address, city, postal_code, latitude, longitude]);

    const newCitizen = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: newCitizen.id, email: newCitizen.email },
      'your-simple-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Citizen registered successfully',
      citizen: {
        id: newCitizen.id,
        email: newCitizen.email,
        first_name: newCitizen.first_name,
        last_name: newCitizen.last_name,
        phone: newCitizen.phone,
        address: newCitizen.address,
        city: newCitizen.city,
        postal_code: newCitizen.postal_code,
        latitude: newCitizen.latitude,
        longitude: newCitizen.longitude,
        role: newCitizen.role,
        created_at: newCitizen.created_at
      },
      token
    });
  } catch (error) {
    console.error('Register citizen error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to register citizen'
    });
  }
};

// Login citizen
const loginCitizen = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await query(`
      SELECT id, email, password_hash, first_name, last_name, phone, address, city, postal_code, 
             latitude, longitude, role, is_active, created_at
      FROM citizens WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'your-simple-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      citizen: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        postal_code: user.postal_code,
        latitude: user.latitude,
        longitude: user.longitude,
        role: user.role,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login citizen error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to login'
    });
  }
};

// Get all citizens (admin only)
const getAllCitizens = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, is_active } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    const queryParams = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      queryParams.push(role);
    }

    if (is_active !== undefined) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      queryParams.push(is_active === 'true');
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM citizens ${whereClause}`, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get citizens with pagination
    paramCount++;
    const citizensQuery = `
      SELECT id, email, first_name, last_name, phone, address, city, postal_code, 
             latitude, longitude, role, is_active, created_at, updated_at
      FROM citizens ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    queryParams.push(parseInt(limit), offset);

    const result = await query(citizensQuery, queryParams);

    res.json({
      citizens: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get all citizens error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve citizens'
    });
  }
};

// Get citizen by ID
const getCitizenById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, email, first_name, last_name, phone, address, city, postal_code, 
             latitude, longitude, role, is_active, created_at, updated_at
      FROM citizens WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Citizen not found',
        message: 'No citizen found with the provided ID'
      });
    }

    res.json({
      citizen: result.rows[0]
    });
  } catch (error) {
    console.error('Get citizen by ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve citizen'
    });
  }
};

// Update citizen profile
const updateCitizen = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone, address, city, postal_code, latitude, longitude } = req.body;

    // Check if citizen exists
    const existingCitizen = await query('SELECT id FROM citizens WHERE id = $1', [id]);
    if (existingCitizen.rows.length === 0) {
      return res.status(404).json({
        error: 'Citizen not found',
        message: 'No citizen found with the provided ID'
      });
    }

    // Update citizen
    const result = await query(`
      UPDATE citizens 
      SET first_name = COALESCE($2, first_name),
          last_name = COALESCE($3, last_name),
          phone = COALESCE($4, phone),
          address = COALESCE($5, address),
          city = COALESCE($6, city),
          postal_code = COALESCE($7, postal_code),
          latitude = COALESCE($8, latitude),
          longitude = COALESCE($9, longitude),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, phone, address, city, postal_code, 
                latitude, longitude, role, is_active, created_at, updated_at
    `, [id, first_name, last_name, phone, address, city, postal_code, latitude, longitude]);

    res.json({
      message: 'Citizen updated successfully',
      citizen: result.rows[0]
    });
  } catch (error) {
    console.error('Update citizen error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update citizen'
    });
  }
};

// Deactivate citizen (soft delete)
const deactivateCitizen = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE citizens 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, email, first_name, last_name, is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Citizen not found',
        message: 'No citizen found with the provided ID'
      });
    }

    res.json({
      message: 'Citizen deactivated successfully',
      citizen: result.rows[0]
    });
  } catch (error) {
    console.error('Deactivate citizen error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to deactivate citizen'
    });
  }
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    res.json({
      citizen: req.user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve user profile'
    });
  }
};

module.exports = {
  registerCitizen,
  loginCitizen,
  getAllCitizens,
  getCitizenById,
  updateCitizen,
  deactivateCitizen,
  getCurrentUser
};
