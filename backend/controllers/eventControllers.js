import Event from "../models/event.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIFilters from "../utils/apiFilters.js";

// Create new event => /api/v1/events
export const newEvent = catchAsyncErrors(async (req, res) => {
    const event = await Event.create(req.body);

    res.status(201).json({
        success: true,
        event,
    });
});

// Get all events => /api/v1/events
export const getEvents = catchAsyncErrors(async (req, res) => {
    const apiFilters = new APIFilters(Event, req.query).search().filters();

    let events = await apiFilters.query;
    let filteredEventsCount = events.length;

    res.status(200).json({
        success: true,
        filteredEventsCount,
        events,
    });
});

// Get single event details => /api/v1/events/:id
export const getEventDetails = catchAsyncErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id).populate("organizer");
    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    res.status(200).json({
        success: true,
        event,
    });
});

// Update event => /api/v1/events/:id
export const updateEvent = catchAsyncErrors(async (req, res, next) => {
    let event = await Event.findById(req.params.id);

    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        event,
        message: "Event updated successfully",
    });
});

// Delete event => /api/v1/events/:id
export const deleteEvent = catchAsyncErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    await event.deleteOne();

    res.status(200).json({
        success: true,
        message: "Event deleted successfully",
    });
});
