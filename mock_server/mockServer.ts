// ...existing code...
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

interface RouteConfig {
  method: string;
  path: string;
  responseFile: string;
}

const app = express();
app.use(express.json());

// Home route for API description
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Mock API Server',
    description: 'This is a mock server for enterprise-search. Use the documented API endpoints for testing.'
  });
});
app.use(express.json());

// Load routes configuration
const routesConfigPath = path.join(__dirname, "/config/routes.json");
const routes: RouteConfig[] = JSON.parse(fs.readFileSync(routesConfigPath, "utf-8"));

// Utility to load response JSON
const loadResponse = (fileName: string) => {
  const filePath = path.join(__dirname, "/responses", fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// Dynamically register routes
routes.forEach((route) => {
  const method = route.method.toLowerCase();
  (app as any)[method](route.path, (req: Request, res: Response) => {
    try {
      res.json(loadResponse(route.responseFile));
    } catch (err) {
      res.status(500).json({ error: `Response file not found: ${route.responseFile}` });
    }
  });
});

// Start server
const PORT = 3021;
app.listen(PORT, () => {
  console.log(`🚀 Mock API server running at http://localhost:${PORT}`);
});