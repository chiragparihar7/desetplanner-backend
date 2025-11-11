import Booking from "../models/Booking.js";
import Cart from "../models/Cart.js";
import nodemailer from "nodemailer";

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
      // ✅ Guest booking requires these fields
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

    // 🧠 If user had items in cart — clear it (optional)
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    // ✅ Setup Nodemailer (Gmail App Password ke sath)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 🧾 Prepare email content
    const userEmail = req.user ? req.user.email : guestEmail;
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

    // ✅ Send confirmation email to user/guest
    await transporter.sendMail({
      from: `"Desert Planners Tourism LLC" <${process.env.ADMIN_EMAIL}>`,
      to: userEmail,
      subject: "Your Desert Planner Booking Confirmation",
      html: `
<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.7;background:#f7f7f7;padding:25px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 5px 18px rgba(0,0,0,0.1);">
    
    <!-- Header -->
    <div style="background:linear-gradient(90deg,#e82429,#721011);padding:22px 0;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:26px;font-weight:700;letter-spacing:0.5px;">🌴 Desert Planner</h1>
      <p style="margin:5px 0 0;font-size:15px;opacity:0.9;">Your Booking Has Been Confirmed</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 30px;">
      <h2 style="margin-top:0;color:#721011;">Dear ${userName},</h2>
      <p style="color:#404041;margin-bottom:20px;">
        Thank you for booking with <b style="color:#e82429;">Desert Planner</b>!  
        Your booking has been <b style="color:#28a745;">successfully confirmed</b> 🎉  
        Below are your booking details:
      </p>

      <!-- Booking Details Box -->
      <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:18px 20px;margin:20px 0;">
        <h3 style="color:#721011;margin-top:0;">🧾 Booking Summary</h3>
        <ul style="padding-left:18px;color:#404041;margin:0;">
          ${bookingDetails}
        </ul>
        <hr style="border:none;border-top:1px solid #eee;margin:12px 0;">
        <p style="margin:6px 0;"><b>Total Price:</b> <span style="color:#e82429;">AED ${totalPrice}</span></p>
        <p style="margin:6px 0;"><b>Pickup Point:</b> ${
          pickupPoint || "N/A"
        }</p>
        <p style="margin:6px 0;"><b>Drop Point:</b> ${dropPoint || "N/A"}</p>
        <p style="margin:6px 0;"><b>Special Request:</b> ${
          specialRequest || "None"
        }</p>
      </div>

      <p style="color:#404041;">
        Our travel team will reach out shortly to confirm pickup arrangements.  
        For queries, feel free to contact us at  
        <a href="mailto:support@desertplanners.net" style="color:#e82429;font-weight:600;text-decoration:none;">support@desertplanners.net</a>.
      </p>

      // <!-- CTA Button -->
      // <div style="text-align:center;margin-top:30px;">
      //   <a href="#"
      //      style="background:linear-gradient(90deg,#e82429,#721011);
      //             color:#fff;
      //             padding:12px 28px;
      //             border-radius:30px;
      //             text-decoration:none;
      //             font-weight:bold;
      //             letter-spacing:0.3px;
      //             box-shadow:0 4px 10px rgba(0,0,0,0.15);
      //             transition:all 0.3s;">
      //     View My Booking
      //   </a>
      // </div>

      <p style="margin-top:30px;color:#555;text-align:center;font-size:15px;">
        Warm regards,<br/>
        <b style="color:#721011;">Desert Planner Team</b><br/>
        <span style="font-size:13px;color:#999;">Dubai, UAE</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#404041;color:#fff;text-align:center;padding:12px;font-size:13px;">
      © 2025 Desert Planners Tourism LLC | All Rights Reserved
    </div>
  </div>
</div>
`,
    });

    // ✅ Send email to admin
    await transporter.sendMail({
      from: `"Desert Planners Tourism LLC" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "🆕 New Booking Received",
      html: `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background:#f6f6f6;">
    <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:linear-gradient(90deg,#e82429,#721011);padding:25px;text-align:center;color:#fff;">
        <h1 style="margin:0;font-size:26px;letter-spacing:0.5px;">🌴 Desert Planner</h1>
        <p style="margin:8px 0 0;font-size:15px;opacity:0.9;">Your Booking Confirmation</p>
      </div>

      <!-- Body -->
      <div style="padding:30px;">
        <h3 style="margin:0 0 10px;color:#721011;">Dear ${userName},</h3>
        <p style="color:#404041;line-height:1.6;">
          Thank you for booking with <b style="color:#e82429;">Desert Planner</b>!  
          Your booking has been <b style="color:#28a745;">confirmed</b>.  
          Here are your trip details 👇
        </p>

        <!-- Booking Details Card -->
        <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:18px;margin:25px 0;">
          ${bookingDetails}
          <p style="margin:8px 0;"><b>Total Price:</b> AED ${totalPrice}</p>
          <p style="margin:8px 0;"><b>Pickup Point:</b> ${
            pickupPoint || "N/A"
          }</p>
          <p style="margin:8px 0;"><b>Drop Point:</b> ${dropPoint || "N/A"}</p>
          <p style="margin:8px 0;"><b>Special Request:</b> ${
            specialRequest || "None"
          }</p>
        </div>

        <p style="color:#404041;line-height:1.6;margin-bottom:25px;">
          Our team will reach out soon to confirm your pickup details.  
          For questions, contact us at  
          <a href="info@desertplanners.net" style="color:#e82429;font-weight:600;text-decoration:none;">
            info@desertplanners.net
          </a>.
        </p>

        <!-- Button -->
        // <div style="text-align:center;">
        //   <a href="https://desertplanner.ae" 
        //      style="background:linear-gradient(90deg,#e82429,#721011);
        //             color:#fff;
        //             padding:12px 30px;
        //             border-radius:30px;
        //             text-decoration:none;
        //             font-weight:bold;
        //             letter-spacing:0.3px;
        //             box-shadow:0 3px 8px rgba(0,0,0,0.2);
        //             transition:all 0.3s;">
        //      View My Booking
        //   </a>
        // </div>
      </div>

      <!-- Footer -->
      <div style="background:#721011;text-align:center;padding:14px;color:#fff;font-size:13px;">
        © 2025 <b>Desert Planners Tourism LLC</b> | Dubai, UAE
      </div>
    </div>
  </body>
</html>
`,
    });

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
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
      .populate("user", "name email") // ✅ Correct field name
      .populate("items.tourId", "title") // ✅ Tour info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
    });
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
