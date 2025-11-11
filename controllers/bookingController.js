import Booking from "../models/Booking.js";
import Cart from "../models/Cart.js";
import { Resend } from "resend";

// 🟢 Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// 🟢 Create Booking (Guest + Logged-in User)
export const createBooking = async (req, res) => {
  try {
    const {
      guestName,
      guestEmail,
      guestContact,
      items,
      pickupPoint,
      dropPoint,
      totalPrice,
      specialRequest,
    } = req.body;

    // 🧩 Prepare booking data
    let bookingData = {
      items,
      totalPrice,
      pickupPoint,
      dropPoint,
      specialRequest,
      status: "confirmed",
    };

    // ✅ If user is logged in
    if (req.user) {
      bookingData.user = req.user._id;
      bookingData.userEmail = req.user.email;
      bookingData.userName = req.user.name;
    } else {
      if (!guestName || !guestEmail || !guestContact) {
        return res.status(400).json({ message: "Guest details are required." });
      }
      bookingData.guestName = guestName;
      bookingData.guestEmail = guestEmail;
      bookingData.guestContact = guestContact;
    }

    // ✅ Save booking and populate tour info
    const booking = await new Booking(bookingData).save();
    await booking.populate("items.tourId", "title price");

    // 🧠 Clear cart if user is logged in
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    // 🧾 Prepare email data
    const userName = req.user ? req.user.name : guestName;

    const bookingDetails = booking.items
      .map(
        (item) => `
        <li style="margin-bottom:10px;">
          <b>Tour:</b> ${item.tourId?.title || "Tour"}<br/>
          <b>Date:</b> ${item.date || "N/A"}<br/>
          <b>Guests:</b> ${item.guests || 1}<br/>
          <b>Pickup:</b> ${item.pickupPoint || pickupPoint || "N/A"}<br/>
          <b>Drop:</b> ${item.dropPoint || dropPoint || "N/A"}
        </li>`
      )
      .join("");

    // 🧠 HTML Template
    const emailHtml = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.7;background:#f7f7f7;padding:25px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 5px 18px rgba(0,0,0,0.1);">
        <div style="background:linear-gradient(90deg,#e82429,#721011);padding:22px 0;text-align:center;color:#fff;">
          <h1 style="margin:0;font-size:26px;font-weight:700;">🌴 Desert Planner</h1>
          <p style="margin:5px 0 0;font-size:15px;opacity:0.9;">New Booking Received</p>
        </div>

        <div style="padding:28px 30px;">
          <h2 style="margin-top:0;color:#721011;">Booking by ${userName}</h2>
          <p style="color:#404041;margin-bottom:20px;">
            A new booking has been placed through your website. Here are the details:
          </p>

          <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:18px 20px;margin:20px 0;">
            <h3 style="color:#721011;margin-top:0;">🧾 Booking Summary</h3>
            <ul style="padding-left:18px;color:#404041;margin:0;">
              ${bookingDetails}
            </ul>
            <hr style="border:none;border-top:1px solid #eee;margin:12px 0;">
            <p><b>Total Price:</b> <span style="color:#e82429;">AED ${totalPrice}</span></p>
            <p><b>Pickup Point:</b> ${pickupPoint || "N/A"}</p>
            <p><b>Drop Point:</b> ${dropPoint || "N/A"}</p>
            <p><b>Special Request:</b> ${specialRequest || "None"}</p>
          </div>

          <p style="color:#404041;">
            Contact Info:<br/>
            <b>Name:</b> ${guestName || req.user?.name || "N/A"}<br/>
            <b>Email:</b> ${guestEmail || req.user?.email || "N/A"}<br/>
            <b>Phone:</b> ${guestContact || "N/A"}
          </p>

          <p style="margin-top:30px;color:#555;text-align:center;font-size:15px;">
            Sent automatically from your website booking system.
          </p>
        </div>

        <div style="background:#404041;color:#fff;text-align:center;padding:12px;font-size:13px;">
          © 2025 Desert Planners Tourism LLC | All Rights Reserved
        </div>
      </div>
    </div>`;

    // 📨 Send only to Admin (testing mode)
    await resend.emails.send({
      from: "Desert Planner <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL, // 👈 Only admin mail (sandbox safe)
      subject: "🆕 New Booking Received - Desert Planner",
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully (admin notified)",
      booking,
    });
  } catch (err) {
    console.error("❌ Error creating booking:", err);
    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: err.message,
    });
  }
};

// 🟡 Get All Bookings (Admin - User + Guest)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user", "name email")
      .populate("items.tourId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: "Error fetching bookings" });
  }
};

// 🔵 Get Single Booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.tourId", "title price location");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ booking });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

// 🔴 Update Booking Status (Admin)
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    console.error("Error updating booking status:", err);
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

// 🟣 Get My Bookings (for Logged-in Users)
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate("items.tourId", "title price location")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching user bookings:", err);
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
};
