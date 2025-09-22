# 🏆 Smart City Waste Management System

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A comprehensive **Node.js/Express API** with **PostgreSQL database** for managing smart city waste collection. Features real-time monitoring, route optimization, citizen engagement, and fleet management.

## 🚀 Features

### 🗑️ Smart Waste Bins
- **Real-time monitoring** with sensor data
- **Geographic location** tracking and queries
- **Fill level monitoring** and alerts
- **Bin type classification** (general, recyclable, organic, hazardous)
- **Capacity management** and statistics

### 🚛 Collection Fleet Management
- **Truck and driver** management
- **Real-time location** tracking
- **Fuel efficiency** monitoring
- **Maintenance scheduling**
- **Status tracking** (available, on_route, maintenance)

### 🛣️ Route Optimization
- **Collection route** planning
- **Bin sequence** optimization
- **Distance and time** calculations
- **Priority-based** routing
- **Performance analytics**

### 👥 Citizen Engagement
- **User registration** and authentication
- **Issue reporting** system
- **Real-time notifications**
- **Public bin information**
- **Community feedback**

### 🔐 Security & Access Control
- **JWT authentication**
- **Role-based authorization** (Admin, Operator, Citizen)
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **SQL injection** prevention

## 🏗️ System Architecture

### Database Design (PostgreSQL)
- **9 interconnected tables** with complex relationships
- **UUID primary keys** for scalability
- **Geographic indexing** for location queries
- **Triggers** for automatic updates
- **Sample data** included for testing

### API Endpoints (Node.js/Express)
- **30+ RESTful endpoints** across 7 entities
- **Comprehensive CRUD operations**
- **Pagination and filtering**
- **Geographic queries**
- **Real-time statistics**

## 📊 Database Schema

```sql
-- Core Entities
✅ citizens (user management with roles)
✅ waste_bins (smart bins with sensors)
✅ collection_trucks (fleet management)
✅ collection_routes (optimized routes)
✅ route_bins (route-bin associations)
✅ collection_events (scheduled pickups)
✅ bin_collections (individual pickups)
✅ citizen_reports (issue reporting)
✅ system_notifications (alerts)
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Peterase-1/Smart-City-Waste-Management-System.git
cd Smart-City-Waste-Management-System
```

2. **Install dependencies**
```bash
cd backend
npm install
```

3. **Set up PostgreSQL database**
```bash
# Create database
createdb waste_management

# Run schema
psql -U postgres -d waste_management -f docs/database_schema.sql
```

4. **Update database configuration**
```javascript
// Edit backend/config/database.js
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'waste_management',
  password: 'YOUR_POSTGRES_PASSWORD', // ← Change this
  port: 5432,
});
```

5. **Start the server**
```bash
npm run dev
```

6. **Test the API**
```bash
# Health check
curl http://localhost:3000/health

# Get all bins
curl http://localhost:3000/api/bins

# Get statistics
curl http://localhost:3000/api/bins/statistics
```

## 📚 API Documentation

### Authentication
- `POST /api/citizens/register` - Register new citizen
- `POST /api/citizens/login` - Login citizen
- `GET /api/citizens/me` - Get current user profile

### Waste Bins
- `GET /api/bins` - Get all waste bins (with filters)
- `GET /api/bins/:id` - Get bin by ID
- `POST /api/bins` - Create new waste bin (admin/operator)
- `PUT /api/bins/:id` - Update waste bin (admin/operator)
- `PATCH /api/bins/:id/fill-level` - Update bin fill level
- `PATCH /api/bins/:id/emptied` - Mark bin as emptied
- `DELETE /api/bins/:id` - Delete waste bin (admin)
- `GET /api/bins/nearby` - Get bins near location
- `GET /api/bins/statistics` - Get bin statistics

### Collection Trucks
- `GET /api/trucks` - Get all collection trucks
- `GET /api/trucks/:id` - Get truck by ID
- `POST /api/trucks` - Create new truck (admin/operator)
- `PUT /api/trucks/:id` - Update truck (admin/operator)
- `PATCH /api/trucks/:id/location` - Update truck location
- `DELETE /api/trucks/:id` - Delete truck (admin)

### Additional Endpoints
- **Collection Routes** - Route planning and optimization
- **Collection Events** - Scheduled pickups and tracking
- **Citizen Reports** - Issue reporting and feedback
- **System Notifications** - Alerts and updates

## 🧪 Sample Data

The database includes ready-to-use sample data:
- **3 Users**: admin, operator, citizen
- **5 Waste Bins**: Different locations and types
- **3 Collection Trucks**: With driver information
- **2 Collection Routes**: Optimized pickup routes
- **Sample Events**: Collection schedules
- **Sample Reports**: Citizen feedback

## 🔐 User Roles

### Citizen
- View waste bins and statistics
- Report issues and feedback
- View notifications
- Access public information

### Operator
- All citizen permissions
- Manage waste bins
- Manage collection trucks
- Manage collection routes
- Manage collection events
- View and respond to reports

### Admin
- All operator permissions
- Manage citizens
- Delete any resource
- System administration

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3000/health
```

### Sample API Calls
```bash
# Register a citizen
curl -X POST http://localhost:3000/api/citizens/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "citizen@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Get bins near location
curl "http://localhost:3000/api/bins/nearby?latitude=40.7128&longitude=-74.0060&radius=5"

# Get bin statistics
curl http://localhost:3000/api/bins/statistics
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT, bcrypt
- **Security**: CORS, input validation
- **Documentation**: Markdown, API docs

## 📁 Project Structure

```
Smart-City-Waste-Management-System/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # API controllers
│   ├── middleware/       # Authentication & validation
│   ├── routes/          # API routes
│   ├── docs/           # Documentation
│   ├── server.js       # Main server file
│   └── package.json    # Dependencies
├── docs/               # Project documentation
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## 🚀 Deployment

### Production Environment
```bash
# Set environment variables
export NODE_ENV=production
export DB_PASSWORD=your-secure-password
export JWT_SECRET=your-very-secure-jwt-secret

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Open an issue on GitHub
- **Email**: Contact the maintainer

## 🎯 Future Enhancements

- [ ] Real-time WebSocket notifications
- [ ] Mobile app integration
- [ ] Machine learning for route optimization
- [ ] IoT sensor integration
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Caching with Redis
- [ ] Microservices architecture

## 🏆 Project Achievements

✅ **Exceeded Requirements**: Built comprehensive system beyond basic CRUD  
✅ **Real-World Application**: Solves actual urban waste management problems  
✅ **Advanced Database Design**: Complex relationships and geographic features  
✅ **Security Implementation**: Authentication, authorization, and validation  
✅ **Scalable Architecture**: Production-ready code structure  
✅ **Comprehensive Documentation**: Detailed setup and API documentation  
✅ **Testing Ready**: Sample data and health checks included  

## 📊 Statistics

- **30+ API Endpoints**
- **9 Database Tables**
- **3 User Roles**
- **5 Sample Waste Bins**
- **3 Collection Trucks**
- **2 Collection Routes**
- **100% Beginner Friendly**

---

## 🎉 Perfect for Database Final Projects!

This Smart City Waste Management System demonstrates **advanced backend development skills** with:
- **Complex database design**
- **Secure API development**
- **Real-world problem solving**
- **Production-ready architecture**

**Star ⭐ this repository if you found it helpful!**

---

**Made with ❤️ for Smart Cities and Sustainable Waste Management**