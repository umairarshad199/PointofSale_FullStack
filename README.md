# PointofSale\_FullStack



A complete full-stack **Point of Sale (POS) System** built with **React**, **ASP.NET Core Web API**, **Entity Framework Core**, and **SQL Server**.

This project is the full-stack version of the original **QuickStop Mart POS Console Application** and the later **QuickStop Mart POS Web API**. It combines a modern React frontend with a secure ASP.NET Core backend and a SQL Server database.

The system provides product and inventory management, shopping cart operations, sales processing, tax calculation, receipt generation, dashboards, JWT authentication, and role-based authorization.



## 📋 Overview



The application is divided into three parts:



### Frontend



A React-based web interface that provides:

* Login and authentication
* Admin dashboard
* User dashboard
* Product management
* Shopping cart
* Sales and checkout
* Receipt management
* Role-based UI access



### Backend



An ASP.NET Core Web API that provides:



* RESTful API endpoints
* Business logic
* Product and inventory management
* Sales processing
* Cart operations
* Receipt generation
* Dashboard statistics
* JWT authentication
* Role-based authorization
* Entity Framework Core database operations



### Database



The application uses:



* Microsoft SQL Server
* SQL Server LocalDB for development
* Entity Framework Core Code-First
* EF Core migrations



# ✨ Features

## 🔐 Authentication \& Authorization



* JWT-based authentication
* Login system with Admin and User roles
* Role-based authorization
* Protected API endpoints
* Protected frontend routes
* Different permissions for Admin and User accounts



## 👨‍💼 Admin Features



Administrators have full access to the management functionality.



* View admin dashboard
* Add products
* Edit products
* Delete products
* Manage product inventory
* View total products
* View total inventory units
* View total sales
* View total revenue
* Monitor low-stock products
* View best-selling products
* View sales
* Manage receipts



## 👤 User Features



Regular users have restricted access to management functionality.



* View available products
* Add products to cart
* Update cart quantities
* Remove products from cart
* Checkout
* Make purchases
* View purchase history
* View personal spending
* View receipts
* View best-selling products



Users **cannot add, edit, or delete products**.



# 🔑 Demo Login Credentials



The application supports two roles: **Admin** and **User**.

These accounts can be used to test the different permissions and functionality available in the system.



## 👨‍💼 Admin Account

|**Field**|**Value**|
|-|-|
|Username|admin|
|Password|Admin@123|

### 

### Admin Access



* Add products
* Edit products
* Delete products
* Manage inventory
* View dashboard statistics
* View sales
* Manage receipts
* View low-stock products
* View best-selling products



## 👤 User Account

|**Field**|**Value**|
|-|-|
|Username|user|
|Password|User@123|

### 

### User Access



* View products
* Add products to cart
* Update cart
* Remove products from cart
* Checkout and make purchases
* View purchase history
* View personal spending
* View receipts
* View best-selling products



# 🛠️ Technologies Used



## Frontend



* React
* JavaScript
* HTML5
* CSS3
* React Router
* Vite



## Backend



* C#
* .NET
* ASP.NET Core Web API
* REST API
* Entity Framework Core
* JWT Authentication
* Role-Based Authorization



## Database



* Microsoft SQL Server
* SQL Server LocalDB
* Entity Framework Core Code-First
* EF Core Migrations



## Development Tools



* Visual Studio
* Visual Studio Code
* SQL Server Management Studio (SSMS)
* Git
* GitHub
* Swagger / OpenAPI
* npm



# 🏗️ System Architecture



The application follows a client-server architecture:


┌─────────────────────────────────────┐
│          React Frontend             │
│                                     │
│  Login                              │
│  Dashboard                          │
│  Products                           │
│  Cart                               │
│  Sales                              │
│  Receipts                           │
└────────────────┬────────────────────┘
                 │
                 │ HTTP / REST API
                 ▼
┌─────────────────────────────────────┐
│       ASP.NET Core Web API          │
│                                     │
│  Controllers                        │
│  Services                           │
│  Authentication                     │
│  Authorization                      │
│  Business Logic                     │
└────────────────┬────────────────────┘
                 │
                 │ Entity Framework Core
                 ▼
┌─────────────────────────────────────┐
│           SQL Server                │
│                                     │
│  Products                           │
│  Users                              │
│  Sales                              │
│  Receipts                           │
│  Receipt Items                      │
└─────────────────────────────────────┘


# 📁 Project Structure


PointofSale\_FullStack/
│
├── QuickStopMart.Api/
│   │
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── CartController.cs
│   │   ├── DashboardController.cs
│   │   ├── ProductsController.cs
│   │   ├── ReceiptsController.cs
│   │   └── SalesController.cs
│   │
│   ├── Data/
│   │   └── AppDbContext.cs
│   │
│   ├── DTOs/
│   │
│   ├── Migrations/
│   │   ├── InitialCreate
│   │   ├── ChangeMoneyTypes
│   │   ├── AddReceiptUserRelation
│   │   ├── AddHiddenFromAdmin
│   │   ├── AddReceiptAmounts
│   │   ├── AddReceiptItems
│   │   ├── ConfigureReceiptMoneyTypes
│   │   └── AppDbContextModelSnapshot.cs
│   │
│   ├── Models/
│   │
│   ├── Services/
│   │
│   ├── Properties/
│   │
│   ├── Program.cs
│   ├── appsettings.json
│   └── QuickStopMart.Api.csproj
│
├── QuickStopMart.Frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar
│   │   │   └── ProtectedRoute
│   │   │
│   │   ├── pages/
│   │   │   ├── Login
│   │   │   ├── Dashboard
│   │   │   ├── Products
│   │   │   ├── Cart
│   │   │   ├── Sales
│   │   │   └── Receipts
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md



# 🔐 Role-Based Access



The system provides different permissions depending on the authenticated user's role.



|**Feature**|**Admin**|**User**|
|-|:-:|:-:|
|Login|✅|✅|
|View Products|✅|✅|
|Add Product|✅|❌|
|Edit Product|✅|❌|
|Delete Product|✅|❌|
|Manage Inventory|✅|❌|
|Add to Cart|✅|✅|
|Update Cart|✅|✅|
|Remove from Cart|✅|✅|
|Checkout|✅|✅|
|View Sales|✅|Limited|
|View Receipts|✅|Own Purchases|
|View Dashboard|✅|✅|
|View Low Stock|✅|❌|
|View Best-Selling Products|✅|✅|



# 🛒 Shopping Cart



The shopping cart allows users to prepare and manage their purchases before checkout.

Features include:



* Add products to cart
* Increase product quantity
* Decrease product quantity
* Remove products
* Calculate item totals
* Calculate subtotal
* Calculate tax
* Calculate grand total
* Validate available stock



# 💰 Sales \& Checkout



The checkout system handles the complete sales process.

During checkout:



1. Cart items are validated.
2. Product availability is checked.
3. Subtotal is calculated.
4. Applicable tax is calculated.
5. Grand total is calculated.
6. Product inventory is reduced.
7. Sale information is stored.
8. Receipt information is generated.



# 🧾 Receipts



The system provides receipt processing functionality.

Receipts contain information related to completed purchases, including:



* Purchased products
* Quantities
* Product prices
* Subtotal
* Tax
* Total amount
* User information
* Receipt items



The backend stores receipt information using Entity Framework Core and SQL Server.



# 📊 Dashboard



The application provides different dashboards based on the logged-in user's role.



## Admin Dashboard



The Admin dashboard provides:



* Total Products
* Total Inventory Units
* Total Sales
* Total Revenue
* Low-Stock Products
* Best-Selling Products
* Current Date



## User Dashboard



The User dashboard provides:



* Available Products
* My Purchases
* My Total Spending
* Recent Purchases
* Best-Selling Products



# 🔄 Tax Calculation



The POS system supports tiered tax calculation based on the sale amount.

The tax rates used by the system include:


5%
8%
10%
12%


The applicable tax rate is determined by the configured business logic.



# 🗄️ Database



The backend uses **Microsoft SQL Server** with **Entity Framework Core**.

The project uses the **Code-First** development approach.

Entity Framework Core is responsible for:



* Database access
* Entity mapping
* Relationships
* Queries
* Data persistence
* Database migrations
* Schema management



## Development Database



The project uses SQL Server LocalDB for local development:
(localdb)\\MSSQLLocalDB


The database name is:
QuickStopMartDb


The actual SQL Server database is **not included in this GitHub repository**.

Instead, EF Core migration files are included so the database schema can be recreated locally.



# 🔄 Entity Framework Core Migrations



The project includes database migrations that track changes to the database schema.



1. To create a new migration:

powershell
dotnet ef migrations add MigrationName


2\. To apply migrations:

powershell
dotnet ef database update


3\. For a fresh setup, run:

powershell
dotnet ef database update


This will create the required database structure in SQL Server LocalDB.



# 🚀 Getting Started

## Prerequisites



Before running the project, install:



* .NET SDK
* Node.js
* npm
* SQL Server LocalDB
* SQL Server Management Studio (optional)
* Git



# 1\. Clone the Repository



bash
git clone https://github.com/umairarshad199/PointofSale\_FullStack.git


* Navigate into the project:

bash
cd PointofSale\_FullStack


# 2\. Configure the Backend



* Navigate to the API project:

powershell
cd QuickStopMart.Api


* Configure the SQL Server connection string.

Example:


{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=QuickStopMartDb;Trusted\_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=True"
  }
}



# 3\. Configure JWT



The backend requires JWT configuration for authentication.

Example:


{
  "Jwt": {
    "Key": "YOUR\_SECRET\_KEY",
    "Issuer": "QuickStopMart",
    "Audience": "QuickStopMartUsers",
    "ExpiryMinutes": 60
  }
}



# 4\. Restore Backend Dependencies



* From the `QuickStopMart.Api` directory:

powershell
dotnet restore


* Build the backend:

powershell
dotnet build




# 5\. Apply Database Migrations



* From the backend directory:

powershell
dotnet ef database update


This creates or updates "QuickStopMartDb" in SQL Server LocalDB.



# 6\. Run the Backend



**From:**
QuickStopMart.Api


**run:**

powershell
dotnet run


The ASP.NET Core Web API will start locally.

Swagger can be used to view and test the API endpoints when enabled.



# 7\. Run the React Frontend



* Open a **new terminal** and navigate to:

powershell
cd QuickStopMart.Frontend


* Install the frontend dependencies:

powershell
npm install


* Start the React development server:

powershell
npm run dev


The terminal will display the local URL where the frontend is running.



# 🔗 Frontend and Backend Communication



The React frontend communicates with the ASP.NET Core backend through RESTful HTTP requests.


React Frontend
      │
      │ HTTP Requests
      ▼
ASP.NET Core Web API
      │
      │ Entity Framework Core
      ▼
SQL Server


Authenticated requests use the JWT token generated during login.



# 📌 Main API Functionality



The backend provides endpoints for the major POS operations, including:



|**Area**|**Functionality**|
|-|-|
|Authentication|Login and JWT token generation|
|Products|View, add, update, and delete products|
|Cart|Add, update, and remove cart items|
|Sales|Start sales and process checkout|
|Dashboard|Retrieve dashboard statistics|
|Receipts|Generate and retrieve receipt information|



The exact API routes can be inspected and tested through Swagger.



# 🧪 Testing



To test the complete application:



### Step 1



Start SQL Server LocalDB.



### Step 2



Apply EF Core migrations:

powershell
dotnet ef database update


### Step 3



Start the ASP.NET Core API:

powershell
dotnet run



### Step 4



Start the React frontend:

powershell
npm run dev


### Step 5



Open the frontend in your browser.



### Step 6



Test the Admin account:


Username: admin
Password: Admin@123


Verify that administrative features such as product management are available.



### Step 7



Log out and test the User account:


Username: user
Password: User@123


Verify that the user can purchase products but cannot add, edit, or delete products.



# 🛡️ Security



The application implements:



* JWT authentication
* Role-based authorization
* Protected frontend routes
* Protected API endpoints
* Admin/User access restrictions
* Secure database access through Entity Framework Core



Sensitive configuration should not be committed to a public repository.

For production environments, use:



* Environment variables
* .NET User Secrets
* Deployment platform secrets
* Secure secret-management services



# 🧹 Git \& Ignored Files



The repository uses `.gitignore` to prevent unnecessary and local files from being committed.

Examples include:


bin/
obj/
.vs/
node\_modules/
dist/
\*.db
\*.sqlite
.env


The SQL Server database itself is **not uploaded to GitHub**.

EF Core migration files are included because they describe the database schema and allow another developer to recreate the database locally.



# 📸 Screenshots



### Login

!\[Login](Screenshots/login.png)

### Admin Dashboard

!\[Admin Dashboard](Screenshots/admin\_dashboard.png)

### User Dashboard

!\[User Dashboard](Screenshots/user\_dashboard.png)

### Products

!\[Products](Screenshots/products.png)

### Shopping Cart

!\[Shopping Cart](Screenshots/cart.png)

### Sales / Checkout

!\[Sales](Screenshots/sales.png)

### Receipts

!\[Receipts](Screenshots/receipts.png)



# 🔮 Future Improvements



Possible future improvements include:



* Barcode scanner integration
* Product categories
* Supplier management
* Customer management
* Advanced sales reports
* PDF receipt generation
* Excel report export
* Inventory alerts
* Product search and filtering
* Payment gateway integration
* Automated unit and integration testing
* Docker support
* Cloud database support
* Production deployment



# 📚 Project Evolution



This project is the third stage in the development of the QuickStop Mart Point of Sale system.



## Version 1 — Console Application



**Repository:** https://github.com/umairarshad199/PointofSale\_ConsoleApp



The original C# console-based POS application demonstrating:



* C# programming
* Object-Oriented Programming
* Product management
* Shopping cart
* Checkout
* Tax calculation
* Inventory management
* Receipt processing



## Version 2 — Web API



**Repository:** https://github.com/umairarshad199/PointofSale\_WebAPI



The console application was converted into an ASP.NET Core Web API with:



* RESTful API endpoints
* ASP.NET Core
* Entity Framework Core
* SQLite
* JWT authentication
* Swagger
* Product management
* Shopping cart
* Checkout
* Receipt processing



## Version 3 — Full-Stack Application



**Repository:** `PointofSale\_FullStack`



The system was expanded into a complete full-stack application with:

* React frontend
* ASP.NET Core Web API
* Entity Framework Core
* SQL Server
* JWT authentication
* Admin/User roles
* Role-based authorization
* Product and inventory management
* Shopping cart
* Sales and checkout
* Receipts
* Role-specific dashboards



# 🤝 Contributing



This project was developed as a full-stack Point of Sale application.

Suggestions, improvements, issues, and pull requests are welcome.

If you find an issue or have an idea for improvement, feel free to open an issue or submit a pull request.



# 👨‍💻 Development



This project was developed to demonstrate practical experience with modern full-stack software development, including:



* Frontend development
* Backend API development
* RESTful services
* Database design
* Entity Framework Core
* SQL Server
* Authentication
* Authorization
* Role-based access control
* Business logic
* Git and GitHub



# 📄 License



This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.



## ⭐ QuickStop Mart



A complete full-stack Point of Sale system built with **React + ASP.NET Core + Entity Framework Core + SQL Server**.


