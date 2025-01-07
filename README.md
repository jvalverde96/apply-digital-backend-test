# Apply Digital - Backend Test API

## Description

This project implements a backend API that interacts with the Contentful API to manage 'Product' entries and provides both public and private modules for data retrieval and reporting. Key features include hourly synchronization with Contentful, paginated public endpoints, private reporting modules, and secure JWT authentication.

The API is built using NestJS, TypeScript, PostgreSQL, and TypeORM, and is fully Dockerized for seamless setup and deployment.

## Features

* Fetches and stores 'Product' data from Contentful every hour.

* Public endpoints for paginated and filtered access to products.

* Private endpoints for generating detailed reports.

* JWT-secured endpoints for private module access.

* Fully documented API available at /api/docs via Swagger.

* CI/CD pipeline with test coverage and linting via GitHub Actions.


## Steps to Run the Application

1. Clone the Repository

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;```git clone https://github.com/jvalverde96/apply-digital-backend-test.git ``` 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;```cd your repository folder```

2. run ```npm install or yarn add``` to install all dependencies locally.

3. Set Up Environment Variables: Create a .env file in the project root and paste the following:

**Important: Copy the content directly from the copy icon in the top-right corner to avoid ASCII character typos.**


```
# Contentful API variables 
CONTENTFUL_SPACE_ID=9xs1613l9f7v
CONTENTFUL_ACCESS_TOKEN=I-ThsT55eE_B3sCUWEQyDT4VqVO3x__20ufuie9usns
CONTENTFUL_ENVIRONMENT=master
CONTENTFUL_CONTENT_TYPE=product

# Server variables

JWT_SECRET_KEY=cT!6B^9rW@q2nV7yXz8\*RtPb3@QxLfW4zUuG9&1YhLsZj2VfMhD
USER_EMAIL=user@gmail.com
PASSWORD=hello123
PORT=3000

# Database variables

POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=admin
POSTGRES_PASSWORD=welcome123
POSTGRES_DB=products_db
```


3. Start the Application: use Docker Compose to build and run the application:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;```docker-compose up --build```

4. Access the API

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* Public module (Products): Accessible without authentication.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* Private module (Reports): Requires a valid JWT in the Authorization header. Use the endpoint  ```http://localhost:3000/auth/login``` &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;in order to get a valid access token. Use the following credentials in the request body to login: 


&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;``` {"email": "user@gmail.com","password": "hello123"}```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;* Swagger documentation: Navigate to http://localhost:3000/api/docs.

5. Force Initial Data Sync
   To manually trigger the first sync with Contentful:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Run from Postman or Swagger: ```http://localhost:3000/products/sync```

## Assumptions

* Products marked as deleted will no longer appear in the GET endpoints but will remain accessible in the database, with the `deleted` flag set to `true`.

* Run the following commands to execute tests and check coverage:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;```npm run test```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;```npm run lint```

## CI/CD Pipeline

The repository includes a GitHub Actions pipeline to automate testing and linting on every push to the main branch.

## Contact

For any issues, please contact me at curly.dev.96@gmail.com
