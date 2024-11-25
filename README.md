
# **Coupon Management System**

## **Overview**
The Coupon Management System is a service designed for e-commerce platforms to manage and apply discount coupons. It supports multiple coupon types, such as cart-wide discounts, product-specific discounts, and Buy X Get Y offers. The system enables seamless coupon validation and application for customer carts, ensuring a streamlined shopping experience.

---

## **Features**
- **Coupon Types Supported**:
  - **Cart-Wise Coupons**: Discounts applied to the total cart value.
  - **Product-Wise Coupons**: Discounts applied to specific products.
  - **Buy X Get Y Coupons (BxGy)**: Offers such as "Buy 2, Get 1 Free".
- **API-Driven**: RESTful endpoints for managing and applying coupons.
- **Scalable and Flexible**: Designed to easily add new coupon types and conditions.
- **Validation**: Ensures coupons are valid and applicable before use.

---

## **API Endpoints**
1. **POST `/applicable-coupons`**  
   Fetch all applicable coupons for a given cart, along with the discount amount for each.

2. **POST `/apply-coupon/{id}`**  
   Apply a specific coupon to the cart and return the updated cart with discounted prices.

---

## **Use Cases**
- Display applicable coupons to users based on their cart.
- Allow users to apply coupons and view real-time discounts during checkout.
- Handle complex promotional offers for specific products or cart thresholds.

---

## **Getting Started**
1. **Prerequisites**:
   - Node.js (v14 or later)
   - MongoDB (local or cloud instance)

2. **Installation**:
   - Clone the repository:
     ```bash
     git clone <repository_url>
     ```
   - Install dependencies:
     ```bash
     npm install
     ```

3. **Environment Setup**:
   - Create a `.env` file and configure the following:
     ```
     NODE_ENV = "development"
     PORT = ""
     TOKEN = ""
     VERSIONS = "v1,v2"
     MONGO_DB = "Coupons"
     MONGO_DB_WRITER = "mongodb+srv://cluster0"
     MONGO_DB_READER = "mongodb+srv://Cluster0"
     ```

4. **Run the Application**:
   ```bash
   npm start
   ```

---

## **Project Structure**
```
.
├── controllers/      # Database and utility controllers
├── models/           # Request payload validation schemas
├── routes/           # API route definitions
├── services/         # Business logic for each API
├── index.js            # Entry point for the application
└── README.md         # Documentation
```

---

## **Future Enhancements**
- Add more coupon types, such as percentage-based or flat-rate discounts.
- Implement analytics for coupon usage.
- Introduce role-based access control (e.g., admin panel for managing coupons).

---

## **License**
This project is licensed under the MIT License. See the LICENSE file for details.
