import HolidayTour from "../models/HolidayTour.js";
import HolidayCategory from "../models/holidayCategoryModel.js";
import slugify from "slugify";

// =============================================================
// ⭐ CREATE HOLIDAY TOUR
// =============================================================
export const createHolidayTour = async (req, res) => {
  try {
    const {
      title,
      duration,
      category,
      priceAdult,
      priceChild,
      description,
      highlights,
      knowBefore,
      inclusions,
      exclusions,
      cancellationPolicy,
      terms,
      itineraryTitle,
    } = req.body;

    // Slider
    const sliderImages = req.files?.sliderImages
      ? req.files.sliderImages.map((img) => img.path)
      : [];

    // Itinerary Images
    const itineraryImages = req.files?.itineraryImages
      ? req.files.itineraryImages.map((img) => img.path)
      : [];

    const itinerary = (itineraryTitle || []).map((title, index) => ({
      day: index + 1,
      title,
      image: itineraryImages[index] || "",
    }));

    const tour = new HolidayTour({
      title,
      slug: slugify(title, { lower: true, strict: true }),
      duration,
      category,
      priceAdult,
      priceChild,
      description,
      sliderImages,
      highlights: JSON.parse(highlights),
      knowBefore,
      inclusions,
      exclusions,
      cancellationPolicy,
      terms,
      itinerary,
    });

    await tour.save();

    res.status(201).json({ success: true, message: "Created", tour });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================================================
// ⭐ GET ALL HOLIDAY TOURS
// =============================================================
export const getAllHolidayTours = async (req, res) => {
  try {
    const tours = await HolidayTour.find().populate("category");
    res.json({ success: true, tours });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// =============================================================
// ⭐ GET SINGLE TOUR BY ID
// =============================================================
export const getHolidayTourById = async (req, res) => {
  try {
    const tour = await HolidayTour.findById(req.params.id).populate("category");
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    res.json({ success: true, tour });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================
// ⭐⭐ UPDATE HOLIDAY TOUR (FULLY FIXED ITINERARY CODE) ⭐⭐
// =============================================================
export const updateHolidayTour = async (req, res) => {
  try {
    const tour = await HolidayTour.findById(req.params.id);
    if (!tour) return res.status(404).json({ message: "Tour not found" });

    // BASIC FIELDS
    tour.title = req.body.title;
    tour.slug = slugify(req.body.title, { lower: true, strict: true });
    tour.duration = req.body.duration;
    tour.category = req.body.category;
    tour.priceAdult = req.body.priceAdult;
    tour.priceChild = req.body.priceChild;
    tour.description = req.body.description;
    tour.highlights = JSON.parse(req.body.highlights);

    // =============== SLIDER IMAGES ===================
    let sliderImages = req.body.existingSliderImages || [];
    if (req.files?.sliderImages) {
      sliderImages = [
        ...sliderImages,
        ...req.files.sliderImages.map((img) => img.path),
      ];
    }
    tour.sliderImages = sliderImages;

    // =========================================================
    // ⭐⭐⭐ FIXED — CORRECT ITINERARY IMAGE INDEX MATCHING ⭐⭐⭐
    // =========================================================

    const titles = Array.isArray(req.body.itineraryTitle)
      ? req.body.itineraryTitle
      : [req.body.itineraryTitle];

    // STEP 1 → Create empty array for new images
    let newImages = Array(titles.length).fill(null);

    // STEP 2 → Read each uploaded file EXACT index from field name
    // e.g. field name: "itineraryImages_3"
    if (req.files) {
      Object.keys(req.files).forEach((fieldName) => {
        if (fieldName.startsWith("itineraryImages_")) {
          const index = Number(fieldName.split("_")[1]); // EXTRACT 3
          const file = req.files[fieldName][0]; // multer array
          if (file) newImages[index] = file.path;
        }
      });
    }

    // STEP 3 → Create final itinerary array without breaking other images
    tour.itinerary = titles.map((title, index) => ({
      day: index + 1,
      title,
      image:
        newImages[index] === "__KEEP_OLD__"
          ? tour.itinerary[index]?.image || ""
          : newImages[index] || tour.itinerary[index]?.image || "",
    }));

    // =============== OTHER ARRAYS ==================
    tour.knowBefore = req.body.knowBefore || [];
    tour.inclusions = req.body.inclusions || [];
    tour.exclusions = req.body.exclusions || [];
    tour.cancellationPolicy = req.body.cancellationPolicy || [];
    tour.terms = req.body.terms || [];

    await tour.save();

    res.json({ success: true, message: "Updated", tour });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

// =============================================================
// ⭐ DELETE TOUR
// =============================================================
export const deleteHolidayTour = async (req, res) => {
  try {
    await HolidayTour.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================
// ⭐ GET TOURS BY CATEGORY SLUG
// =============================================================
export const getToursByCategory = async (req, res) => {
  try {
    const category = await HolidayCategory.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ message: "Category not found" });

    const tours = await HolidayTour.find({ category: category._id }).select(
      "title slug priceAdult sliderImages duration"
    );

    res.json({ success: true, tours });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================================================
// ⭐ GET PACKAGE BY SLUG
// =============================================================
export const getHolidayPackageBySlug = async (req, res) => {
  try {
    const { packageSlug } = req.params;

    const tour = await HolidayTour.findOne({ slug: packageSlug }).populate(
      "category"
    );

    if (!tour) return res.status(404).json({ message: "Package not found" });

    res.json(tour);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
