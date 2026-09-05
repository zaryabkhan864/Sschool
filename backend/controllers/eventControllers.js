import mongoose from "mongoose";
import Event from "../models/event.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { delete_file, upload_file } from "../utils/cloudinary.js";

const ORGANIZER_SELECT = "firstName middleName lastName email";

// Create new event => POST /api/v1/admin/events
// Image (if provided as a base64 data URL, same as the avatar-upload
// pattern in userControllers.js) is uploaded to Cloudinary here — never
// trust a plain URL string from the client as if it were already hosted.
export const newEvent = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus } = req.cookies;
    const body = { ...req.body };

    if (body.image && typeof body.image === "string" && body.image.startsWith("data:")) {
        try {
            body.image = await upload_file(body.image);
        } catch (error) {
            return next(new ErrorHandler(`Image upload failed: ${error.message}`, 500));
        }
    } else {
        delete body.image;
    }

    if (!body.campus && cookieCampus) {
        body.campus = cookieCampus;
    }

    const event = await Event.create(body);

    res.status(201).json({
        success: true,
        event,
    });
});

// Get all events => GET /api/v1/events
// Real server-side pagination + filtering (was previously fetching
// every event and letting the frontend slice/filter client-side).
export const getEvents = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus } = req.cookies;
    const { keyword, campus, isPaid, dateFrom, dateTo, page, limit, paginate, countOnly } = req.query;

    const filter = {};
    const finalCampus = campus || cookieCampus;
    if (finalCampus && mongoose.Types.ObjectId.isValid(finalCampus)) filter.campus = finalCampus;
    if (isPaid !== undefined) filter.isPaid = isPaid === "true";
    if (dateFrom || dateTo) {
        filter.date = {};
        if (dateFrom) filter.date.$gte = new Date(dateFrom);
        if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const trimmedKeyword = keyword?.trim();
    if (trimmedKeyword) {
        filter.$or = [
            { eventName: { $regex: trimmedKeyword, $options: "i" } },
            { description: { $regex: trimmedKeyword, $options: "i" } },
            { venue: { $regex: trimmedKeyword, $options: "i" } },
        ];
    }

    const total = await Event.countDocuments(filter);
    if (countOnly === "true") return res.status(200).json({ success: true, total });

    const isDropdownRequest = Number(limit) === 0 || paginate === "false";
    let query = Event.find(filter)
        .sort({ date: -1 })
        .populate("campus", "name")
        .populate("organizer", ORGANIZER_SELECT);

    let paginationMeta = null;
    if (!isDropdownRequest) {
        const finalLimit = limit ? Number(limit) : 10;
        const finalPage = Math.max(Number(page) || 1, 1);
        query = query.skip((finalPage - 1) * finalLimit).limit(finalLimit);
        paginationMeta = { total, page: finalPage, limit: finalLimit, totalPages: Math.ceil(total / finalLimit) };
    }

    const events = await query;

    res.status(200).json({
        success: true,
        count: events.length,
        total,
        ...(paginationMeta && { pagination: paginationMeta }),
        events,
    });
});

// 👇 NEW: totals for the stat cards (total / paid / upcoming)
export const getEventStats = catchAsyncErrors(async (req, res, next) => {
    const { campus: cookieCampus } = req.cookies;
    const filter = {};
    if (cookieCampus && mongoose.Types.ObjectId.isValid(cookieCampus)) filter.campus = cookieCampus;

    const now = new Date();
    const [total, paid, upcoming] = await Promise.all([
        Event.countDocuments(filter),
        Event.countDocuments({ ...filter, isPaid: true }),
        Event.countDocuments({ ...filter, date: { $gte: now } }),
    ]);

    res.status(200).json({ success: true, stats: { total, paid, upcoming } });
});

// Get single event details => GET /api/v1/event/:id
export const getEventDetails = catchAsyncErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id)
        .populate("organizer", ORGANIZER_SELECT)
        .populate("campus", "name code");

    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    res.status(200).json({
        success: true,
        event,
    });
});

// Update event => PUT /api/v1/admin/event/:id
// Same three-way image handling as updateUser's avatar: a new base64
// data URL replaces (and cleans up) the old Cloudinary image; an
// explicit null/"" clears it; anything else (image simply omitted from
// the request) leaves the existing image untouched.
export const updateEvent = catchAsyncErrors(async (req, res, next) => {
    let event = await Event.findById(req.params.id);

    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    const body = { ...req.body };

    if (body.image && typeof body.image === "string" && body.image.startsWith("data:")) {
        try {
            const uploaded = await upload_file(body.image);
            if (event.image?.public_id) {
                await delete_file(event.image.public_id);
            }
            body.image = uploaded;
        } catch (error) {
            return next(new ErrorHandler(`Image upload failed: ${error.message}`, 500));
        }
    } else if (body.image === null || body.image === "") {
        if (event.image?.public_id) {
            await delete_file(event.image.public_id);
        }
        body.image = null;
    } else {
        delete body.image;
    }

    event = await Event.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        event,
        message: "Event updated successfully",
    });
});

// Delete event => DELETE /api/v1/admin/event/:id
// 👇 FIX: previously deleted the DB record but left the Cloudinary image
// orphaned forever. Now cleaned up first.
export const deleteEvent = catchAsyncErrors(async (req, res, next) => {
    const event = await Event.findById(req.params.id);

    if (!event) {
        return next(new ErrorHandler("Event not found", 404));
    }

    if (event.image?.public_id) {
        await delete_file(event.image.public_id);
    }

    await event.deleteOne();

    res.status(200).json({
        success: true,
        message: "Event deleted successfully",
    });
});
