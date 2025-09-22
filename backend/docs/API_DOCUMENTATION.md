# Smart City Waste Management System - API Documentation

## 📚 Overview

This document provides comprehensive API documentation for the Smart City Waste Management System. The API is built with Node.js/Express and uses PostgreSQL as the database.

## 🔗 Base URL

```
http://localhost:3000
```

## 🔐 Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Response Format

All API responses follow this format:

```json
{
  "message": "Success message",
  "data": { ... },
  "pagination": { ... } // For paginated responses
}
```

Error responses:
```json
{
  "error": "Error type",
  "message": "Error description",
  "details": [ ... ] // For validation errors
}
```

## 🚀 API Endpoints

### 1. Health Check

#### GET /health
Check if the API is running and database is connected.

**Response:**
```json
{
  "status": "OK",
  "message": "Smart City Waste Management API is running",
  "timestamp": "2025-09-22T10:30:00.000Z",
  "database": "Connected"
}
```

---

## 👥 Citizens API

### Authentication Endpoints

#### POST /api/citizens/register
Register a new citizen.

**Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "Smart City",
  "postal_code": "12345",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Response (201):**
```json
{
  "message": "Citizen registered successfully",
  "citizen": {
    "id": "uuid",
    "email": "citizen@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "Smart City",
    "postal_code": "12345",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "role": "citizen",
    "created_at": "2025-09-22T10:30:00.000Z"
  },
  "token": "jwt-token"
}
```

#### POST /api/citizens/login
Login a citizen.

**Request Body:**
```json
{
  "email": "citizen@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "citizen": {
    "id": "uuid",
    "email": "citizen@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "citizen"
  },
  "token": "jwt-token"
}
```

### Citizen Management

#### GET /api/citizens/me
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "citizen": {
    "id": "uuid",
    "email": "citizen@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "citizen"
  }
}
```

#### GET /api/citizens
Get all citizens (Admin/Operator only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role
- `is_active` (optional): Filter by active status

**Response (200):**
```json
{
  "citizens": [
    {
      "id": "uuid",
      "email": "citizen@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "citizen",
      "is_active": true,
      "created_at": "2025-09-22T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### GET /api/citizens/:id
Get citizen by ID (Admin/Operator only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "citizen": {
    "id": "uuid",
    "email": "citizen@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "citizen",
    "is_active": true,
    "created_at": "2025-09-22T10:30:00.000Z"
  }
}
```

#### PUT /api/citizens/:id
Update citizen profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "Smart City",
  "postal_code": "12345",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

#### DELETE /api/citizens/:id
Deactivate citizen (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Citizen deactivated successfully",
  "citizen": {
    "id": "uuid",
    "email": "citizen@example.com",
    "is_active": false
  }
}
```

---

## 🗑️ Waste Bins API

### Public Endpoints

#### GET /api/bins
Get all waste bins.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `bin_type` (optional): Filter by bin type (general, recyclable, organic, hazardous)
- `fill_level_min` (optional): Minimum fill level (0-100)
- `fill_level_max` (optional): Maximum fill level (0-100)
- `location` (optional): Search by location name

**Response (200):**
```json
{
  "bins": [
    {
      "id": "uuid",
      "bin_code": "WB001",
      "location_name": "Central Park Main Entrance",
      "latitude": 40.7829,
      "longitude": -73.9654,
      "bin_type": "general",
      "capacity_liters": 240,
      "current_fill_level": 75,
      "sensor_status": "active",
      "last_emptied": "2025-09-21T08:00:00.000Z",
      "installation_date": "2025-09-01",
      "created_at": "2025-09-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

#### GET /api/bins/nearby
Get bins near a specific location.

**Query Parameters:**
- `latitude` (required): Latitude coordinate
- `longitude` (required): Longitude coordinate
- `radius` (optional): Search radius in km (default: 5)

**Response (200):**
```json
{
  "bins": [
    {
      "id": "uuid",
      "bin_code": "WB001",
      "location_name": "Central Park Main Entrance",
      "latitude": 40.7829,
      "longitude": -73.9654,
      "bin_type": "general",
      "current_fill_level": 75,
      "distance_km": 2.5
    }
  ],
  "search_location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "radius_km": 5
}
```

#### GET /api/bins/statistics
Get bin statistics.

**Response (200):**
```json
{
  "statistics": {
    "total_bins": 5,
    "full_bins": 1,
    "medium_bins": 2,
    "empty_bins": 2,
    "active_sensors": 4,
    "inactive_sensors": 1,
    "average_fill_level": "45.20",
    "bin_types": {
      "general": 2,
      "recyclable": 2,
      "organic": 1,
      "hazardous": 0
    }
  }
}
```

#### GET /api/bins/:id
Get bin by ID.

**Response (200):**
```json
{
  "bin": {
    "id": "uuid",
    "bin_code": "WB001",
    "location_name": "Central Park Main Entrance",
    "latitude": 40.7829,
    "longitude": -73.9654,
    "bin_type": "general",
    "capacity_liters": 240,
    "current_fill_level": 75,
    "sensor_status": "active",
    "last_emptied": "2025-09-21T08:00:00.000Z",
    "installation_date": "2025-09-01",
    "is_active": true,
    "created_at": "2025-09-01T10:00:00.000Z"
  }
}
```

### Protected Endpoints (Admin/Operator only)

#### POST /api/bins
Create new waste bin.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "bin_code": "WB006",
  "location_name": "Times Square",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "bin_type": "recyclable",
  "capacity_liters": 180
}
```

**Response (201):**
```json
{
  "message": "Waste bin created successfully",
  "bin": {
    "id": "uuid",
    "bin_code": "WB006",
    "location_name": "Times Square",
    "latitude": 40.7580,
    "longitude": -73.9855,
    "bin_type": "recyclable",
    "capacity_liters": 180,
    "current_fill_level": 0,
    "sensor_status": "active",
    "installation_date": "2025-09-22",
    "created_at": "2025-09-22T10:30:00.000Z"
  }
}
```

#### PUT /api/bins/:id
Update waste bin.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "location_name": "Updated Location",
  "latitude": 40.7580,
  "longitude": -73.9855,
  "bin_type": "general",
  "capacity_liters": 200,
  "current_fill_level": 50,
  "sensor_status": "active"
}
```

#### PATCH /api/bins/:id/fill-level
Update bin fill level (for sensors).

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "current_fill_level": 85
}
```

#### PATCH /api/bins/:id/emptied
Mark bin as emptied.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Bin marked as emptied successfully",
  "bin": {
    "id": "uuid",
    "bin_code": "WB001",
    "current_fill_level": 0,
    "last_emptied": "2025-09-22T10:30:00.000Z"
  }
}
```

#### DELETE /api/bins/:id
Delete waste bin (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Waste bin deleted successfully",
  "bin": {
    "id": "uuid",
    "bin_code": "WB001",
    "is_active": false
  }
}
```

---

## 🚛 Collection Trucks API

### GET /api/trucks
Get all collection trucks (Admin/Operator only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (available, on_route, maintenance, out_of_service)

**Response (200):**
```json
{
  "trucks": [
    {
      "id": "uuid",
      "truck_number": "T001",
      "driver_name": "Mike Rodriguez",
      "driver_phone": "+1234567893",
      "capacity_liters": 5000,
      "fuel_efficiency": 8.5,
      "current_location_lat": 40.7128,
      "current_location_lng": -74.0060,
      "status": "available",
      "last_maintenance_date": "2025-08-15",
      "next_maintenance_date": "2025-10-15",
      "created_at": "2025-09-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

### GET /api/trucks/:id
Get truck by ID (Admin/Operator only).

### POST /api/trucks
Create new collection truck (Admin/Operator only).

**Request Body:**
```json
{
  "truck_number": "T004",
  "driver_name": "Jane Smith",
  "driver_phone": "+1234567896",
  "capacity_liters": 5500,
  "fuel_efficiency": 9.0,
  "current_location_lat": 40.7128,
  "current_location_lng": -74.0060
}
```

### PUT /api/trucks/:id
Update collection truck (Admin/Operator only).

### PATCH /api/trucks/:id/location
Update truck location (Admin/Operator only).

**Request Body:**
```json
{
  "current_location_lat": 40.7580,
  "current_location_lng": -73.9855
}
```

### DELETE /api/trucks/:id
Delete collection truck (Admin only).

---

## 🛣️ Collection Routes API

### GET /api/routes
Get all collection routes (Admin/Operator only).

### GET /api/routes/:id
Get route by ID (Admin/Operator only).

### POST /api/routes
Create new collection route (Admin/Operator only).

### PUT /api/routes/:id
Update collection route (Admin/Operator only).

### DELETE /api/routes/:id
Delete collection route (Admin only).

---

## 📅 Collection Events API

### GET /api/events
Get all collection events (Admin/Operator only).

### GET /api/events/:id
Get event by ID (Admin/Operator only).

### POST /api/events
Create new collection event (Admin/Operator only).

### PUT /api/events/:id
Update collection event (Admin/Operator only).

### DELETE /api/events/:id
Delete collection event (Admin only).

---

## 📝 Citizen Reports API

### GET /api/reports
Get all citizen reports (Admin/Operator only).

### GET /api/reports/:id
Get report by ID (Admin/Operator only).

### POST /api/reports
Create new citizen report (Authenticated users).

**Request Body:**
```json
{
  "bin_id": "uuid",
  "report_type": "overflow",
  "description": "Bin is overflowing and attracting pests",
  "severity": "high"
}
```

### PUT /api/reports/:id
Update citizen report (Admin/Operator only).

### DELETE /api/reports/:id
Delete citizen report (Admin only).

---

## 🔔 System Notifications API

### GET /api/notifications
Get all notifications (Authenticated users).

### GET /api/notifications/:id
Get notification by ID (Authenticated users).

### POST /api/notifications
Create notification (Admin/Operator only).

### PUT /api/notifications/:id
Update notification (Admin/Operator only).

### DELETE /api/notifications/:id
Delete notification (Admin only).

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

## 📝 Validation Rules

### Citizens
- Email: Valid email format, unique
- Password: Minimum 6 characters
- First/Last name: Minimum 2 characters
- Phone: Valid phone number format
- Coordinates: Valid latitude (-90 to 90) and longitude (-180 to 180)

### Waste Bins
- Bin code: Minimum 3 characters, unique
- Location name: Minimum 3 characters
- Coordinates: Valid latitude and longitude
- Bin type: One of (general, recyclable, organic, hazardous)
- Capacity: Between 50 and 10000 liters

### Collection Trucks
- Truck number: Minimum 3 characters, unique
- Driver name: Minimum 2 characters
- Capacity: Between 1000 and 20000 liters
- Fuel efficiency: Between 1 and 50 km/liter

## 🔐 Role Permissions

| Endpoint | Citizen | Operator | Admin |
|----------|---------|----------|-------|
| GET /api/bins | ✅ | ✅ | ✅ |
| POST /api/bins | ❌ | ✅ | ✅ |
| GET /api/trucks | ❌ | ✅ | ✅ |
| POST /api/trucks | ❌ | ✅ | ✅ |
| GET /api/citizens | ❌ | ✅ | ✅ |
| DELETE /api/citizens/:id | ❌ | ❌ | ✅ |

## 📊 Rate Limiting

Currently no rate limiting is implemented, but it's recommended for production use.

## 🔄 Pagination

All list endpoints support pagination:

```
GET /api/bins?page=1&limit=10
```

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🧪 Testing

Use the provided sample data or create test data using the API endpoints. The database schema includes sample data for immediate testing.

## 📞 Support

For API support and questions, refer to the main README.md file or check the server logs for detailed error information.
