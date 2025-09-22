const { query } = require('../config/database');

// Get all waste bins
const getAllBins = async (req, res) => {
  try {
    const { page = 1, limit = 10, bin_type, fill_level_min, fill_level_max, location } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = true';
    const queryParams = [];
    let paramCount = 0;

    if (bin_type) {
      paramCount++;
      whereClause += ` AND bin_type = $${paramCount}`;
      queryParams.push(bin_type);
    }

    if (fill_level_min) {
      paramCount++;
      whereClause += ` AND current_fill_level >= $${paramCount}`;
      queryParams.push(parseInt(fill_level_min));
    }

    if (fill_level_max) {
      paramCount++;
      whereClause += ` AND current_fill_level <= $${paramCount}`;
      queryParams.push(parseInt(fill_level_max));
    }

    if (location) {
      paramCount++;
      whereClause += ` AND location_name ILIKE $${paramCount}`;
      queryParams.push(`%${location}%`);
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM waste_bins ${whereClause}`, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get bins with pagination
    paramCount++;
    const binsQuery = `
      SELECT id, bin_code, location_name, latitude, longitude, bin_type, capacity_liters, 
             current_fill_level, sensor_status, last_emptied, installation_date, created_at, updated_at
      FROM waste_bins ${whereClause}
      ORDER BY current_fill_level DESC, created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    queryParams.push(parseInt(limit), offset);

    const result = await query(binsQuery, queryParams);

    res.json({
      bins: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get all bins error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve waste bins'
    });
  }
};

// Get bin by ID
const getBinById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, bin_code, location_name, latitude, longitude, bin_type, capacity_liters, 
             current_fill_level, sensor_status, last_emptied, installation_date, is_active, created_at, updated_at
      FROM waste_bins WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Bin not found',
        message: 'No waste bin found with the provided ID'
      });
    }

    res.json({
      bin: result.rows[0]
    });
  } catch (error) {
    console.error('Get bin by ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve waste bin'
    });
  }
};

// Create new waste bin
const createBin = async (req, res) => {
  try {
    const { bin_code, location_name, latitude, longitude, bin_type, capacity_liters, current_fill_level = 0 } = req.body;

    // Check if bin code already exists
    const existingBin = await query('SELECT id FROM waste_bins WHERE bin_code = $1', [bin_code]);
    if (existingBin.rows.length > 0) {
      return res.status(400).json({
        error: 'Bin code already exists',
        message: 'A waste bin with this code already exists'
      });
    }

    const result = await query(`
      INSERT INTO waste_bins (bin_code, location_name, latitude, longitude, bin_type, capacity_liters, current_fill_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, bin_code, location_name, latitude, longitude, bin_type, capacity_liters, 
                current_fill_level, sensor_status, installation_date, created_at
    `, [bin_code, location_name, latitude, longitude, bin_type, capacity_liters, current_fill_level]);

    res.status(201).json({
      message: 'Waste bin created successfully',
      bin: result.rows[0]
    });
  } catch (error) {
    console.error('Create bin error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create waste bin'
    });
  }
};

// Update waste bin
const updateBin = async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name, latitude, longitude, bin_type, capacity_liters, current_fill_level, sensor_status } = req.body;

    // Check if bin exists
    const existingBin = await query('SELECT id FROM waste_bins WHERE id = $1', [id]);
    if (existingBin.rows.length === 0) {
      return res.status(404).json({
        error: 'Bin not found',
        message: 'No waste bin found with the provided ID'
      });
    }

    const result = await query(`
      UPDATE waste_bins 
      SET location_name = COALESCE($2, location_name),
          latitude = COALESCE($3, latitude),
          longitude = COALESCE($4, longitude),
          bin_type = COALESCE($5, bin_type),
          capacity_liters = COALESCE($6, capacity_liters),
          current_fill_level = COALESCE($7, current_fill_level),
          sensor_status = COALESCE($8, sensor_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, bin_code, location_name, latitude, longitude, bin_type, capacity_liters, 
                current_fill_level, sensor_status, last_emptied, installation_date, created_at, updated_at
    `, [id, location_name, latitude, longitude, bin_type, capacity_liters, current_fill_level, sensor_status]);

    res.json({
      message: 'Waste bin updated successfully',
      bin: result.rows[0]
    });
  } catch (error) {
    console.error('Update bin error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update waste bin'
    });
  }
};

// Update bin fill level (for sensors)
const updateBinFillLevel = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_fill_level } = req.body;

    if (current_fill_level < 0 || current_fill_level > 100) {
      return res.status(400).json({
        error: 'Invalid fill level',
        message: 'Fill level must be between 0 and 100'
      });
    }

    const result = await query(`
      UPDATE waste_bins 
      SET current_fill_level = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, bin_code, current_fill_level, sensor_status
    `, [id, current_fill_level]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Bin not found',
        message: 'No waste bin found with the provided ID'
      });
    }

    res.json({
      message: 'Bin fill level updated successfully',
      bin: result.rows[0]
    });
  } catch (error) {
    console.error('Update bin fill level error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update bin fill level'
    });
  }
};

// Mark bin as emptied
const markBinEmptied = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE waste_bins 
      SET current_fill_level = 0, last_emptied = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, bin_code, current_fill_level, last_emptied
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Bin not found',
        message: 'No waste bin found with the provided ID'
      });
    }

    res.json({
      message: 'Bin marked as emptied successfully',
      bin: result.rows[0]
    });
  } catch (error) {
    console.error('Mark bin emptied error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to mark bin as emptied'
    });
  }
};

// Delete waste bin (soft delete)
const deleteBin = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE waste_bins 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, bin_code, is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Bin not found',
        message: 'No waste bin found with the provided ID'
      });
    }

    res.json({
      message: 'Waste bin deleted successfully',
      bin: result.rows[0]
    });
  } catch (error) {
    console.error('Delete bin error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete waste bin'
    });
  }
};

// Get bins near location
const getBinsNearLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Location required',
        message: 'Latitude and longitude are required'
      });
    }

    // Calculate distance using Haversine formula
    const result = await query(`
      SELECT id, bin_code, location_name, latitude, longitude, bin_type, capacity_liters, 
             current_fill_level, sensor_status, last_emptied,
             (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
              sin(radians(latitude)))) AS distance_km
      FROM waste_bins 
      WHERE is_active = true
      HAVING (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
              sin(radians(latitude)))) <= $3
      ORDER BY distance_km
    `, [latitude, longitude, radius]);

    res.json({
      bins: result.rows,
      search_location: { latitude, longitude },
      radius_km: parseFloat(radius)
    });
  } catch (error) {
    console.error('Get bins near location error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve nearby waste bins'
    });
  }
};

// Get bin statistics
const getBinStatistics = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_bins,
        COUNT(CASE WHEN current_fill_level >= 80 THEN 1 END) as full_bins,
        COUNT(CASE WHEN current_fill_level >= 50 AND current_fill_level < 80 THEN 1 END) as medium_bins,
        COUNT(CASE WHEN current_fill_level < 50 THEN 1 END) as empty_bins,
        COUNT(CASE WHEN sensor_status = 'active' THEN 1 END) as active_sensors,
        COUNT(CASE WHEN sensor_status = 'inactive' THEN 1 END) as inactive_sensors,
        AVG(current_fill_level) as average_fill_level,
        COUNT(CASE WHEN bin_type = 'general' THEN 1 END) as general_bins,
        COUNT(CASE WHEN bin_type = 'recyclable' THEN 1 END) as recyclable_bins,
        COUNT(CASE WHEN bin_type = 'organic' THEN 1 END) as organic_bins,
        COUNT(CASE WHEN bin_type = 'hazardous' THEN 1 END) as hazardous_bins
      FROM waste_bins 
      WHERE is_active = true
    `;

    const result = await query(statsQuery);
    const stats = result.rows[0];

    res.json({
      statistics: {
        total_bins: parseInt(stats.total_bins),
        full_bins: parseInt(stats.full_bins),
        medium_bins: parseInt(stats.medium_bins),
        empty_bins: parseInt(stats.empty_bins),
        active_sensors: parseInt(stats.active_sensors),
        inactive_sensors: parseInt(stats.inactive_sensors),
        average_fill_level: parseFloat(stats.average_fill_level || 0).toFixed(2),
        bin_types: {
          general: parseInt(stats.general_bins),
          recyclable: parseInt(stats.recyclable_bins),
          organic: parseInt(stats.organic_bins),
          hazardous: parseInt(stats.hazardous_bins)
        }
      }
    });
  } catch (error) {
    console.error('Get bin statistics error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve bin statistics'
    });
  }
};

module.exports = {
  getAllBins,
  getBinById,
  createBin,
  updateBin,
  updateBinFillLevel,
  markBinEmptied,
  deleteBin,
  getBinsNearLocation,
  getBinStatistics
};
