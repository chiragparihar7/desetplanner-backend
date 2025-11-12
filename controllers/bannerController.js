import Banner from "../models/Banner.js";

/* -----------------------------------------------
   🖼️  CREATE BANNER (with image upload)
------------------------------------------------ */
export const createBanner = async (req, res) => {
  try {
    console.log("📩 Incoming files:", req.files);
    console.log("📩 Incoming body:", req.body);

    const { title, subtitle, price, cta, link, order } = req.body;

    if (!req.files?.desktopImage || !req.files?.mobileImage) {
      return res.status(400).json({
        message: "Both desktop and mobile images are required.",
      });
    }

    const desktopUrl = req.files.desktopImage?.[0]?.path;
    const mobileUrl = req.files.mobileImage?.[0]?.path;

    if (!desktopUrl || !mobileUrl) {
      return res.status(400).json({
        message: "File upload failed, missing image URLs from Cloudinary.",
      });
    }

    const banner = new Banner({
      title,
      subtitle,
      price,
      cta,
      link,
      order,
      desktopImage: desktopUrl,
      mobileImage: mobileUrl,
    });

    await banner.save();
    res.status(201).json({ message: "✅ Banner created successfully", banner });
  } catch (error) {
    console.error("❌ Error creating banner:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------------------------
   ✏️  UPDATE BANNER (optional new images)
------------------------------------------------ */
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    const { title, subtitle, price, cta, link, order, visible } = req.body;

    if (req.files?.desktopImage?.[0]) {
      banner.desktopImage = req.files.desktopImage[0].path;
    }
    if (req.files?.mobileImage?.[0]) {
      banner.mobileImage = req.files.mobileImage[0].path;
    }

    banner.title = title || banner.title;
    banner.subtitle = subtitle || banner.subtitle;
    banner.price = price || banner.price;
    banner.cta = cta || banner.cta;
    banner.link = link || banner.link;
    banner.order = order ?? banner.order;
    banner.visible = visible ?? banner.visible;

    await banner.save();
    res.json({ message: "✅ Banner updated successfully", banner });
  } catch (error) {
    console.error("❌ Error updating banner:", error);
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------------------------
   📜  GET ALL BANNERS
------------------------------------------------ */
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* -----------------------------------------------
   ❌  DELETE BANNER
------------------------------------------------ */
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "🗑️ Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
