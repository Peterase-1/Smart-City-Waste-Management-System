// Validation middleware for request data

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

const validateCoordinates = (lat, lng) => {
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  return latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180;
};

// Citizen validation
const validateCitizen = (req, res, next) => {
  const { email, password, first_name, last_name, phone, address, city, postal_code, latitude, longitude } = req.body;
  const errors = [];

  if (!email || !validateEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (!first_name || first_name.trim().length < 2) {
    errors.push('First name is required and must be at least 2 characters');
  }

  if (!last_name || last_name.trim().length < 2) {
    errors.push('Last name is required and must be at least 2 characters');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Invalid phone number format');
  }

  if (latitude && longitude && !validateCoordinates(latitude, longitude)) {
    errors.push('Invalid coordinates');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Waste bin validation
const validateWasteBin = (req, res, next) => {
  const { bin_code, location_name, latitude, longitude, bin_type, capacity_liters } = req.body;
  const errors = [];

  if (!bin_code || bin_code.trim().length < 3) {
    errors.push('Bin code is required and must be at least 3 characters');
  }

  if (!location_name || location_name.trim().length < 3) {
    errors.push('Location name is required and must be at least 3 characters');
  }

  if (!latitude || !longitude || !validateCoordinates(latitude, longitude)) {
    errors.push('Valid latitude and longitude are required');
  }

  if (!bin_type || !['general', 'recyclable', 'organic', 'hazardous'].includes(bin_type)) {
    errors.push('Bin type must be one of: general, recyclable, organic, hazardous');
  }

  if (!capacity_liters || capacity_liters < 50 || capacity_liters > 10000) {
    errors.push('Capacity must be between 50 and 10000 liters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Collection truck validation
const validateCollectionTruck = (req, res, next) => {
  const { truck_number, driver_name, capacity_liters, fuel_efficiency } = req.body;
  const errors = [];

  if (!truck_number || truck_number.trim().length < 3) {
    errors.push('Truck number is required and must be at least 3 characters');
  }

  if (!driver_name || driver_name.trim().length < 2) {
    errors.push('Driver name is required and must be at least 2 characters');
  }

  if (!capacity_liters || capacity_liters < 1000 || capacity_liters > 20000) {
    errors.push('Capacity must be between 1000 and 20000 liters');
  }

  if (fuel_efficiency && (fuel_efficiency < 1 || fuel_efficiency > 50)) {
    errors.push('Fuel efficiency must be between 1 and 50 km/liter');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Collection route validation
const validateCollectionRoute = (req, res, next) => {
  const { route_name, estimated_duration_minutes, total_distance_km, priority_level } = req.body;
  const errors = [];

  if (!route_name || route_name.trim().length < 3) {
    errors.push('Route name is required and must be at least 3 characters');
  }

  if (estimated_duration_minutes && (estimated_duration_minutes < 1 || estimated_duration_minutes > 1440)) {
    errors.push('Estimated duration must be between 1 and 1440 minutes (24 hours)');
  }

  if (total_distance_km && (total_distance_km < 0 || total_distance_km > 1000)) {
    errors.push('Total distance must be between 0 and 1000 km');
  }

  if (priority_level && (priority_level < 1 || priority_level > 5)) {
    errors.push('Priority level must be between 1 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

// Citizen report validation
const validateCitizenReport = (req, res, next) => {
  const { report_type, description, severity } = req.body;
  const errors = [];

  if (!report_type || !['overflow', 'damaged', 'missing', 'odor', 'other'].includes(report_type)) {
    errors.push('Report type must be one of: overflow, damaged, missing, odor, other');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters');
  }

  if (severity && !['low', 'medium', 'high', 'critical'].includes(severity)) {
    errors.push('Severity must be one of: low, medium, high, critical');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  next();
};

module.exports = {
  validateEmail,
  validatePhone,
  validateCoordinates,
  validateCitizen,
  validateWasteBin,
  validateCollectionTruck,
  validateCollectionRoute,
  validateCitizenReport
};
