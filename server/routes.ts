import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPersonSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all people
  app.get("/api/people", async (req, res) => {
    try {
      const people = await storage.getAllPeople();
      res.json(people);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch people" });
    }
  });

  // Get person by ID
  app.get("/api/people/:id", async (req, res) => {
    try {
      const person = await storage.getPerson(req.params.id);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch person" });
    }
  });

  // Create new person
  app.post("/api/people", async (req, res) => {
    try {
      const validatedData = insertPersonSchema.parse(req.body);
      const person = await storage.createPerson(validatedData);
      res.status(201).json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create person" });
    }
  });

  // Update person
  app.put("/api/people/:id", async (req, res) => {
    try {
      const validatedData = insertPersonSchema.partial().parse(req.body);
      const person = await storage.updatePerson(req.params.id, validatedData);
      if (!person) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.json(person);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update person" });
    }
  });

  // Delete person
  app.delete("/api/people/:id", async (req, res) => {
    try {
      const success = await storage.deletePerson(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Person not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete person" });
    }
  });

  // Import people from CSV
  app.post("/api/people/import", async (req, res) => {
    try {
      const { people } = req.body;
      if (!Array.isArray(people)) {
        return res.status(400).json({ message: "Invalid data format" });
      }
      
      const validatedPeople = people.map(person => insertPersonSchema.parse(person));
      const importedPeople = await storage.importPeople(validatedPeople);
      res.status(201).json(importedPeople);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to import people" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
