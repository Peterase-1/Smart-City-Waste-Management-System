const { query } = require('../config/database');

// Get all collection trucks
const getAllTrucks = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = true';
    const queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      queryParams.push(status);
    }

    // Get total count
    const countResult = await query(`SELECT COUNT(*) FROM collection_trucks ${whereClause}`, queryParams);
    const totalCount = parseInt(countResult.rows[0].count);

    // Get trucks with pagination
    paramCount++;
    const trucksQuery = `
      SELECT id, truck_number, driver_name, driver_phone, capacity_liters, fuel_efficiency, 
             current_location_lat, current_location_lng, status, last_maintenance_date, 
             next_maintenance_date, created_at, updated_at
      FROM collection_trucks ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    queryParams.push(parseInt(limit), offset);

    const result = await query(trucksQuery, queryParams);

    res.json({
      trucks: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get all trucks error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve collection trucks'
    });
  }
};

// Get truck by ID
const getTruckById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, truck_number, driver_name, driver_phone, capacity_liters, fuel_efficiency, 
             current_location_lat, current_location_lng, status, last_maintenance_date, 
             next_maintenance_date, is_active, created_at, updated_at
      FROM collection_trucks WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Truck not found',
        message: 'No collection truck found with the provided ID'
      });
    }

    res.json({
      truck: result.rows[0]
    });
  } catch (error) {
    console.error('Get truck by ID error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve collection truck'
    });
  }
};

// Create new collection truck
const createTruck = async (req, res) => {
  try {
    const { truck_number, driver_name, driver_phone, capacity_liters, fuel_efficiency,
      current_location_lat, current_location_lng } = req.body;

    // Check if truck number already exists
    const existingTruck = await query('SELECT id FROM collection_trucks WHERE truck_number = $1', [truck_number]);
    if (existingTruck.rows.length > 0) {
      return res.status(400).json({
        error: 'Truck number already exists',
        message: 'A collection truck with this number already exists'
      });
    }

    const result = await query(`
      INSERT INTO collection_trucks (truck_number, driver_name, driver_phone, capacity_liters, 
                                   fuel_efficiency, current_location_lat, current_location_lng)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, truck_number, driver_name, driver_phone, capacity_liters, fuel_efficiency, 
                current_location_lat, current_location_lng, status, created_at
    `, [truck_number, driver_name, driver_phone, capacity_liters, fuel_efficiency,
      current_location_lat, current_location_lng]);

    res.status(201).json({
      message: 'Collection truck created successfully',
      truck: result.rows[0]
    });
  } catch (error) {
    console.error('Create truck error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create collection truck'
    });
  }
};

// Update collection truck
const updateTruck = async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_name, driver_phone, capacity_liters, fuel_efficiency,
      current_location_lat, current_location_lng, status } = req.body;

    const result = await query(`
      UPDATE collection_trucks 
      SET driver_name = COALESCE($2, driver_name),
          driver_phone = COALESCE($3, driver_phone),
          capacity_liters = COALESCE($4, capacity_liters),
          fuel_efficiency = COALESCE($5, fuel_efficiency),
          current_location_lat = COALESCE($6, current_location_lat),
          current_location_lng = COALESCE($7, current_location_lng),
          status = COALESCE($8, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, truck_number, driver_name, driver_phone, capacity_liters, fuel_efficiency, 
                current_location_lat, current_location_lng, status, last_maintenance_date, 
                next_maintenance_date, created_at, updated_at
    `, [id, driver_name, driver_phone, capacity_liters, fuel_efficiency,
      current_location_lat, current_location_lng, status]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Truck not found',
        message: 'No collection truck found with the provided ID'
      });
    }

    res.json({
      message: 'Collection truck updated successfully',
      truck: result.rows[0]
    });
  } catch (error) {
    console.error('Update truck error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update collection truck'
    });
  }
};

// Update truck location
const updateTruckLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_location_lat, current_location_lng } = req.body;

    const result = await query(`
      UPDATE collection_trucks 
      SET current_location_lat = $2, current_location_lng = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, truck_number, current_location_lat, current_location_lng
    `, [id, current_location_lat, current_location_lng]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Truck not found',
        message: 'No collection truck found with the provided ID'
      });
    }

    res.json({
      message: 'Truck location updated successfully',
      truck: result.rows[0]
    });
  } catch (error) {
    console.error('Update truck location error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update truck location'
    });
  }
};

// Delete collection truck (soft delete)
const deleteTruck = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      UPDATE collection_trucks 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, truck_number, is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Truck not found',
        message: 'No collection truck found with the provided ID'
      });
    }

    res.json({
      message: 'Collection truck deleted successfully',
      truck: result.rows[0]
    });
  } catch (error) {
    console.error('Delete truck error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete collection truck'
    });
  }
};

module.exports = {
  getAllTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  updateTruckLocation,
  deleteTruck
};
