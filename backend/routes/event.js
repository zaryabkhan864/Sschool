import express from "express";
import { authorizeRoles, isAuthenticatedUser } from "../middlewares/auth.js";
import {
    newEvent,
    getEvents,
    getEventDetails,
    updateEvent,
    deleteEvent,
} from "../controllers/eventControllers.js";

const router = express.Router();

// Create new event (Admin only)
router
    .route("/admin/events")
    .post(isAuthenticatedUser, authorizeRoles("admin"), newEvent);

// Get all events
router.route("/events").get(getEvents);

// Get single event details
router.route("/event/:id").get(getEventDetails);

// Update or delete event (Admin only)
router
    .route("/admin/event/:id")
    .put(isAuthenticatedUser, authorizeRoles("admin"), updateEvent)
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteEvent);

export default router;
