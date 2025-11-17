// ⭐ COMPLETE UPDATED BOOKING CONTROLLER (Adult + Child Support)

import Booking from "../models/Booking.js";
import Cart from "../models/Cart.js";
import { Resend } from "resend";
import Tour from "../models/Tour.js"; // ⭐ IMPORTANT for price fetching
import PDFDocument from "pdfkit";

import path from "path";

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

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items required" });
    }

    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      let tour = null;
      try {
        tour = await Tour.findById(item.tourId);
      } catch (err) {
        tour = null;
      }

      const adultPrice = Number(item.adultPrice || tour?.priceAdult || 0);
      const childPrice = Number(item.childPrice || tour?.priceChild || 0);

      const adultCount = Number(item.adultCount || 0);
      const childCount = Number(item.childCount || 0);

      const itemTotal = adultPrice * adultCount + childPrice * childCount;
      subtotal += itemTotal;

      processedItems.push({
        tourId: item.tourId,
        date: item.date,
        pickupPoint,
        dropPoint,
        adultCount,
        childCount,
        adultPrice,
        childPrice,
      });
    }

    // ⭐ NEW: TRANSACTION FEE + FINAL PRICE
    const transactionFee = Number((subtotal * 0.0375).toFixed(2));
    const finalTotal = Number((subtotal + transactionFee).toFixed(2));

    console.log("💰 SUBTOTAL:", subtotal);
    console.log("💰 FEE (3.75%):", transactionFee);
    console.log("💰 FINAL TOTAL:", finalTotal);

    // ⭐ SAVE BOOKING WITH NEW FIELDS
    const bookingData = {
      items: processedItems,
      subtotal,               // NEW
      transactionFee,         // NEW
      totalPrice: finalTotal, // UPDATED
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

    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
    }

    // ⭐ EMAIL SUMMARY
    const bookingDetails = booking.items
      .map(
        (item) => `
        <li>
          <b>Tour:</b> ${item.tourId?.title}<br/>
          <b>Date:</b> ${item.date}<br/>
          <b>Adults:</b> ${item.adultCount} × ${item.adultPrice}<br/>
          <b>Child:</b> ${item.childCount} × ${item.childPrice}<br/>
        </li>`
      )
      .join("");

    // ⭐ UPDATED EMAIL WITH FEES
    const emailHtml = `
      <div style="font-family:Arial;padding:20px;">
        <h2>New Booking Received</h2>
        <p><b>Name:</b> ${booking.guestName || booking.userName}</p>
        <p><b>Email:</b> ${booking.guestEmail || booking.userEmail}</p>
        <hr/>
        <h3>Booking Summary</h3>
        <ul>${bookingDetails}</ul>
        <hr/>
        <p><b>Subtotal:</b> AED ${subtotal}</p>
        <p><b>Fee (3.75%):</b> AED ${transactionFee}</p>
        <p><b>Total Payable:</b> AED ${finalTotal}</p>
        <p><b>Booking ID:</b> ${booking._id}</p>
      </div>
    `;

    await resend.emails.send({
      from: "Desert Planners <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL,
      subject: "New Booking Received",
      html: emailHtml,
    });

    res.status(200).json({
      success: true,
      message: "Booking successful",
      booking,
    });

  } catch (err) {
    console.error("❌ Error creating booking:", err);
    res.status(500).json({ success: false, message: "Error", error: err.message });
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
    const booking = await Booking.findById(req.params.id).populate(
      "items.tourId",
      "title"
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const doc = new PDFDocument({ size: "A4", margin: 0 });

    res.setHeader(
      "Content-disposition",
      `attachment; filename=invoice-${booking._id}.pdf`
    );
    res.setHeader("Content-type", "application/pdf");

    doc.pipe(res);

    // HEADER
    doc.rect(0, 0, 595, 120).fill("#f1f5f9");

    try {
      const logo = path.join(process.cwd(), "public", "desertplanners_logo.png");
      doc.image(logo, 40, 30, { width: 140 });
    } catch (err) {}

    const X = 330;
    doc
      .fill("#1e293b")
      .font("Helvetica-Bold")
      .fontSize(26)
      .text("BOOKING RECEIPT", X, 35);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fill("#475569")
      .text(`Invoice ID: ${booking._id}`, X, 75)
      .text(`Payment Status: ${booking.paymentStatus}`, X, 92)
      .text(`Date: ${new Date(booking.createdAt).toLocaleString()}`, X, 110);

    // MAIN CARD
    doc.roundedRect(30, 140, 535, 690, 14).fill("#fff").stroke("#e2e8f0");

    let y = 170;

    // FROM + BILL TO
    doc.font("Helvetica-Bold").fontSize(14).fill("#3b82f6").text("From", 50, y);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fill("#475569")
      .text("Desert Planners Tourism LLC", 50, y + 20)
      .text("Dubai, UAE", 50, y + 35)
      .text("info@desertplanners.net", 50, y + 50)
      .text("+97143546677", 50, y + 65);

    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .fill("#3b82f6")
      .text("Bill To", 330, y);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fill("#475569")
      .text(booking.guestName || booking.userName, 330, y + 20)
      .text(booking.guestEmail || booking.userEmail, 330, y + 35)
      .text(booking.guestContact || "—", 330, y + 50);

    // TABLE HEADER
    y += 120;

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fill("#1e293b")
      .text("Description", 50, y)
      .text("Qty", 260, y)
      .text("Price", 360, y)
      .text("Amount", 460, y);

    doc.moveTo(50, y + 18).lineTo(550, y + 18).stroke("#e2e8f0");

    // TABLE ROWS
    y += 30;

    booking.items.forEach((item, i) => {
      const rowBg = i % 2 === 0 ? "#f8fafc" : "#ffffff";

      doc.save().fill(rowBg).rect(50, y - 10, 500, 28).fill().restore();

      const qty = item.adultCount + item.childCount;
      const amount =
        item.adultCount * item.adultPrice + item.childCount * item.childPrice;

      doc
        .font("Helvetica")
        .fontSize(11)
        .fill("#1e293b")
        .text(item.tourId?.title, 55, y)
        .text(qty, 260, y)
        .text(`AED ${item.adultPrice}`, 360, y)
        .text(`AED ${amount}`, 460, y);

      y += 30;
    });

    // ==========================
    // UPDATED TOTAL SUMMARY CARD
    // ==========================

    y += 30;

    doc.roundedRect(320, y, 200, 110, 12).fill("#eef6ff").stroke("#bfdbfe");

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fill("#1e293b")
      .text(`Subtotal: AED ${booking.subtotal}`, 335, y + 10);

    doc
      .font("Helvetica")
      .fontSize(12)
      .fill("#1e293b")
      .text(`Fee (3.75%): AED ${booking.transactionFee}`, 335, y + 35);

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fill("#3b82f6")
      .text(`Total: AED ${booking.totalPrice}`, 335, y + 65);

    // FOOTER
    doc
      .font("Helvetica")
      .fontSize(10)
      .fill("#64748b")
      .text(
        "This invoice is auto-generated and does not require a signature.",
        0,
        810,
        { align: "center" }
      );

    doc.end();

  } catch (err) {
    res.status(500).json({ message: "Invoice failed" });
  }
};