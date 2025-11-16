import VisaBooking from "../models/VisaBooking.js";

// Helper: get file URL if exists
const fileUrl = (req, field) => {
  return req.files?.[field]?.[0]?.path || "";
};

// 🟢 Create Visa Booking
export const createVisaBooking = async (req, res) => {
  try {
    const data = req.body;

    const booking = new VisaBooking({
      ...data,
      passportFront: fileUrl(req, "passportFront"),
      passportBack: fileUrl(req, "passportBack"),
      passportCover: fileUrl(req, "passportCover"),
      photo: fileUrl(req, "photo"),
      accommodation: fileUrl(req, "accommodation"),
      emiratesId: fileUrl(req, "emiratesId"),
      extraId: fileUrl(req, "extraId"),
      oldVisa: fileUrl(req, "oldVisa"),
      flightTicket: fileUrl(req, "flightTicket"),
    });

    await booking.save();

    res.status(201).json({
      message: "Visa booking submitted successfully",
      booking,
    });
  } catch (err) {
    console.error("❌ Visa Booking Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Get all bookings
export const getAllVisaBookings = async (req, res) => {
  try {
    const list = await VisaBooking.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔵 Get single booking
export const getVisaBookingById = async (req, res) => {
  try {
    const booking = await VisaBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🟡 Update booking status
export const updateVisaBookingStatus = async (req, res) => {
  try {
    const booking = await VisaBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status || booking.status;
    await booking.save();

    res.json({ message: "Status updated", booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Delete booking
export const deleteVisaBooking = async (req, res) => {
  try {
    await VisaBooking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
