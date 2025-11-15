// ⭐ COMPLETE UPDATED BOOKING CONTROLLER (Adult + Child Support)

import Booking from "../models/Booking.js";
import Cart from "../models/Cart.js";
import { Resend } from "resend";
import Tour from "../models/Tour.js"; // ⭐ IMPORTANT for price fetching
import PDFDocument from "pdfkit";


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
      specialRequest,
    } = req.body;

    console.log("📩 BOOKING BODY RECEIVED:", req.body);
    console.log("📦 RECEIVED ITEMS:", items);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    let totalPrice = 0;
    const processedItems = [];

    for (const item of items) {
      console.log("\n=============================");
      console.log("🟡 Processing Item:", item);

      let tour = null;

      try {
        tour = await Tour.findById(item.tourId);
      } catch (err) {
        tour = null;
      }

      console.log(
        "🟢 Tour Found:",
        tour ? tour.title : "NO (Using fallback price)"
      );

      // ⭐ NEVER ALLOW NaN — fallback priority:
      const adultPrice = Number(
        item.adultPrice || (tour ? tour.priceAdult : 0) || 0
      );

      const childPrice = Number(
        item.childPrice || (tour ? tour.priceChild : 0) || 0
      );

      // ⭐ Always numbers
      const adultCount = Number(item.adultCount || 0);
      const childCount = Number(item.childCount || 0);

      console.log("💰 PRICE DEBUG:", {
        adultPrice,
        childPrice,
        adultCount,
        childCount,
      });

      const itemTotal = adultPrice * adultCount + childPrice * childCount;

      totalPrice += itemTotal;

      processedItems.push({
        tourId: item.tourId, // <-- ALWAYS PASS ORIGINAL ID (string)
        date: item.date,
        pickupPoint,
        dropPoint,
        adultCount,
        childCount,
        adultPrice,
        childPrice,
      });
    }

    console.log("📦 FINAL PROCESSED ITEMS:", processedItems);
    console.log("💰 FINAL TOTAL PRICE:", totalPrice);

    // ⭐ BUILD BOOKING DATA
    const bookingData = {
      items: processedItems,
      totalPrice,
      pickupPoint,
      dropPoint,
      specialRequest,
      status: "pending",
      paymentStatus: "pending",
    };

    if (req.user) {
      bookingData.user = req.user._id;
      bookingData.userEmail = req.user.email;
      bookingData.userName = req.user.name;
    } else {
      bookingData.guestName = guestName;
      bookingData.guestEmail = guestEmail;
      bookingData.guestContact = guestContact;
    }

    const booking = await new Booking(bookingData).save();

    await booking.populate("items.tourId", "title priceAdult priceChild");

    // 🧠 Clear logged-in user's cart
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    // =============== EMAIL SECTION ===============

    const userName = req.user ? req.user.name : guestName;

    const bookingDetails = booking.items
      .map(
        (item) => `
        <li style="margin-bottom:10px;">
          <b>Tour:</b> ${item.tourId?.title}<br/>
          <b>Date:</b> ${item.date}<br/>
          <b>Adults:</b> ${item.adultCount} × ${item.adultPrice}<br/>
          <b>Child:</b> ${item.childCount} × ${item.childPrice}<br/>
          <b>Pickup:</b> ${item.pickupPoint || "N/A"}<br/>
          <b>Drop:</b> ${item.dropPoint || "N/A"}
        </li>`
      )
      .join("");

    const emailHtml = `
<div style="font-family:'Segoe UI',Arial,sans-serif;line-height:1.7;background:#f7f7f7;padding:25px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 5px 18px rgba(0,0,0,0.1);">
    
    <div style="background:linear-gradient(90deg,#e82429,#721011);padding:22px 0;text-align:center;color:#fff;">
      <h1 style="margin:0;font-size:26px;font-weight:700;">🌴 Desert Planners Tourism LLC</h1>
      <p style="margin:5px 0 0;font-size:15px;opacity:0.9;">New Booking Received</p>
    </div>

    <div style="padding:28px 30px;">

      <h2 style="margin-top:0;color:#721011;">Booking by ${userName}</h2>

      <!-- ⭐ USER / GUEST DETAILS BLOCK ⭐ -->
      <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:18px 20px;margin-top:18px;">
        <h3 style="color:#721011;margin-top:0;">🧑 Customer Details</h3>
        <p style="margin:5px 0;"><b>Name:</b> ${userName}</p>
        <p style="margin:5px 0;"><b>Email:</b> ${
          req.user ? req.user.email : guestEmail
        }</p>
        <p style="margin:5px 0;"><b>Contact:</b> ${
          req.user ? "---" : guestContact
        }</p>
        <p style="margin:5px 0;"><b>Pickup Point:</b> ${pickupPoint}</p>
        <p style="margin:5px 0;"><b>Drop Point:</b> ${dropPoint}</p>
        <p style="margin:5px 0;"><b>Special Request:</b> ${
          specialRequest || "None"
        }</p>
        <p style="margin:5px 0;"><b>Booking ID:</b> ${booking._id}</p>
      </div>

      <!-- ⭐ BOOKING SUMMARY ⭐ -->
      <div style="background:#fafafa;border:1px solid #eee;border-radius:12px;padding:18px 20px;margin:20px 0;">
        <h3 style="color:#721011;margin-top:0;">🧾 Booking Summary</h3>
        <ul style="padding-left:18px;color:#404041;margin:0;">
          ${bookingDetails}
        </ul>
        <hr>
        <p><b>Total Price:</b> <span style="color:#e82429;">AED ${totalPrice}</span></p>
      </div>

    </div>
  </div>
</div>`;

    console.log("📧 ADMIN EMAIL:", process.env.ADMIN_EMAIL);

    await resend.emails.send({
      from: "Desert Planners Tourism LLC <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject: "🆕 New Booking Received - Desert Planners Tourism LLC",
      html: emailHtml,
    });

    // =====================================================

    res.status(200).json({
      success: true,
      message: "Booking successful",
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
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// 🔵 Get Single Booking
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.tourId", "title priceAdult priceChild location");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch booking" });
  }
};

// 🔴 Update Booking Status
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = req.body.status;
    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ message: "Failed to update booking status" });
  }
};

// 🟣 Get My Bookings
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user._id;
    const bookings = await Booking.find({ user: userId })
      .populate("items.tourId", "title priceAdult priceChild location")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user bookings" });
  }
};

export const lookupBooking = async (req, res) => {
  try {
    const { bookingId, email } = req.query;

    if (!bookingId || !email) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and Email are required",
      });
    }

    const booking = await Booking.findById(bookingId).populate(
      "items.tourId",
      "title priceAdult priceChild"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No booking found with this ID",
      });
    }

    if (booking.guestEmail !== email.toLowerCase()) {
      return res.status(401).json({
        success: false,
        message: "Email does not match this booking",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const downloadInvoice = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("items.tourId", "title");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    let filename = `invoice-${booking._id}.pdf`;
    res.setHeader("Content-disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    // ========================= HEADER =========================
    doc.rect(0, 0, doc.page.width, 140).fill("#1a1a1a");

    doc
      .fill("#ffffff")
      .fontSize(30)
      .font("Helvetica-Bold")
      .text("Desert Planners Tourism LLC", 40, 40);

    doc
      .fontSize(14)
      .font("Helvetica")
      .fill("#d0d0d0")
      .text("Travel Booking Invoice", 40, 85);

    // =================== GLASS CARD BACKGROUND ==================
    doc
      .roundedRect(25, 160, doc.page.width - 50, 420, 20)
      .fillOpacity(0.15)
      .fill("#bdbdbd")
      .fillOpacity(1);

    // ======================== SECTION TITLE ========================
    doc
      .fill("#1a1a1a")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("Booking Information", 50, 175);

    doc.moveDown(1);

    // ======================== CUSTOMER DETAILS ========================
    doc.fontSize(12).font("Helvetica").fill("#333");

    const detailsY = 215;

    doc.text(`Booking ID: ${booking._id}`, 50, detailsY);
    doc.text(`Customer Name: ${booking.guestName}`, 50, detailsY + 20);
    doc.text(`Email: ${booking.guestEmail}`, 50, detailsY + 40);
    doc.text(`Contact: ${booking.guestContact}`, 50, detailsY + 60);

    // ======================== TABLE HEADER ========================
    let tableTop = 310;

    doc
      .font("Helvetica-Bold")
      .fontSize(13)
      .fill("#1a1a1a")
      .text("Tour", 50, tableTop)
      .text("Date", 210, tableTop)
      .text("Adults", 310, tableTop)
      .text("Children", 390, tableTop)
      .text("Amount", 480, tableTop);

    doc
      .moveTo(50, tableTop + 18)
      .lineTo(550, tableTop + 18)
      .stroke("#bbb");

    // ======================== TABLE ROWS ========================
    let y = tableTop + 35;

    booking.items.forEach((item) => {
      const totalItem =
        item.adultCount * item.adultPrice +
        item.childCount * item.childPrice;

      doc.font("Helvetica").fontSize(12).fill("#333");

      // ===== FIXED WIDTH FOR TITLE + AUTO WRAP =====
      const titleWidth = 150;

      doc.text(item.tourId?.title, 50, y, {
        width: titleWidth,
        lineBreak: true,
      });

      // Date
      doc.text(new Date(item.date).toLocaleDateString(), 210, y);

      // Adults
      doc.text(`${item.adultCount} × ${item.adultPrice}`, 310, y);

      // Children
      doc.text(`${item.childCount} × ${item.childPrice}`, 390, y);

      // Amount
      doc.text(`AED ${totalItem}`, 480, y);

      // Auto height for wrap
      const titleHeight = doc.heightOfString(item.tourId?.title, {
        width: titleWidth,
      });

      y += titleHeight + 12; // Row height adjusts dynamically
    });

    // ====================== TOTAL CARD ===========================
    doc.roundedRect(330, y + 20, 200, 70, 15).fill("#1a1a1a");

    doc
      .font("Helvetica-Bold")
      .fontSize(18)
      .fill("#ffffff")
      .text("Total Amount", 350, y + 35);

    doc.fontSize(22).fill("#e82429").text(`AED ${booking.totalPrice}`, 350, y + 60);

    // ====================== FOOTER ===========================
    doc
      .fill("#555")
      .fontSize(10)
      .text(
        "This is a computer generated invoice. For support contact desertplanner@gmail.com",
        40,
        doc.page.height - 40,
        { align: "center" }
      );

    doc.end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Invoice generation failed" });
  }
};

