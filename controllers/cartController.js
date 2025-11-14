import Cart from "../models/Cart.js";
import mongoose from "mongoose";

// 🛒 Add item to cart
export const addToCart = async (req, res) => {
  const {
    userId,
    tourId,
    date,
    guestsAdult,
    guestsChild,
    adultPrice,
    childPrice,
  } = req.body;

  try {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = new Cart({ user: userId, items: [] });

    cart.items.push({
      tourId,
      date,

      guestsAdult: guestsAdult || 0,
      guestsChild: guestsChild || 0,

      adultPrice: adultPrice || 0,
      childPrice: childPrice || 0,
    });

    await cart.save();

    // return populated cart
    const populatedCart = await Cart.findOne({ user: userId }).populate(
      "items.tourId",
      "title priceAdult priceChild mainImage"
    );

    res.status(200).json({
      success: true,
      message: "Added to cart",
      cart: populatedCart.items,
    });
  } catch (err) {
    console.error("Cart Add Error:", err);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: err.message,
    });
  }
};

// 🧾 Get user cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate(
      "items.tourId",
      "title priceAdult priceChild mainImage"
    );

    res.status(200).json({
      success: true,
      cart: cart?.items || [],
    });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
      error: err.message,
    });
  }
};


// ❌ Remove single item
export const removeItem = async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    ).populate("items.tourId", "title priceAdult priceChild mainImage");

    res.status(200).json({
      success: true,
      cart: cart?.items || [],
    });
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ success: false, message: "Error removing item" });
  }
};

 // 🧹 Clear entire cart
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    );

    res.status(200).json({ success: true, cart: [] });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ success: false, message: "Error clearing cart" });
  }
};
