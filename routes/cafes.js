const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Cafe = require('../models/Cafe');
const Rating = require('../models/Rating');
const { authMiddleware, ownerMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create a new cafe (Owner only)
router.post('/', authMiddleware, ownerMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      website,
      minBudget,
      maxBudget,
      amenities,
      hours
    } = req.body;

    // Process uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const cafe = new Cafe({
      name,
      description,
      owner: req.user._id,
      images,
      location: {
        address,
        city,
        state,
        zipCode
      },
      contact: {
        phone,
        email,
        website: website || ''
      },
      averageBudget: {
        min: parseFloat(minBudget),
        max: parseFloat(maxBudget)
      },
      amenities: amenities ? JSON.parse(amenities) : [],
      hours: hours ? JSON.parse(hours) : {},
      menu: []
    });

    await cafe.save();

    res.status(201).json({
      message: 'Cafe created successfully',
      cafe
    });
  } catch (error) {
    console.error('Create cafe error:', error);
    res.status(500).json({ message: 'Server error during cafe creation' });
  }
});

// Get all cafes with search and filters
router.get('/', async (req, res) => {
  try {
    const {
      city,
      state,
      minBudget,
      maxBudget,
      amenities,
      sortBy = 'rating',
      page = 1,
      limit = 10,
      search
    } = req.query;

    // Build query
    let query = { isActive: true };

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }

    if (minBudget || maxBudget) {
      query.averageBudget = {};
      if (minBudget) {
        query.averageBudget.$gte = parseFloat(minBudget);
      }
      if (maxBudget) {
        query.averageBudget.$lte = parseFloat(maxBudget);
      }
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      query.amenities = { $in: amenityList };
    }

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.city': new RegExp(search, 'i') }
      ];
    }

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { 'ratings.average': -1 };
        break;
      case 'budget-low':
        sort = { 'averageBudget.min': 1 };
        break;
      case 'budget-high':
        sort = { 'averageBudget.max': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { 'ratings.average': -1 };
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const cafes = await Cafe.find(query)
      .populate('owner', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);

    const total = await Cafe.countDocuments(query);

    res.json({
      cafes,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalCafes: total,
        hasNext: pageNumber < Math.ceil(total / limitNumber),
        hasPrev: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('Get cafes error:', error);
    res.status(500).json({ message: 'Server error while fetching cafes' });
  }
});

// Get cafe by ID
router.get('/:id', async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    res.json(cafe);
  } catch (error) {
    console.error('Get cafe error:', error);
    res.status(500).json({ message: 'Server error while fetching cafe' });
  }
});

// Update cafe (Owner only)
router.put('/:id', authMiddleware, ownerMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    // Check if the user owns this cafe
    if (cafe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this cafe' });
    }

    const {
      name,
      description,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      website,
      minBudget,
      maxBudget,
      amenities,
      hours
    } = req.body;

    // Process new uploaded images
    const newImages = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    // Keep existing images and add new ones
    const updatedImages = [...(cafe.images || []), ...newImages];

    const updateData = {
      name: name || cafe.name,
      description: description || cafe.description,
      images: updatedImages,
      location: {
        address: address || cafe.location.address,
        city: city || cafe.location.city,
        state: state || cafe.location.state,
        zipCode: zipCode || cafe.location.zipCode,
        coordinates: cafe.location.coordinates
      },
      contact: {
        phone: phone || cafe.contact.phone,
        email: email || cafe.contact.email,
        website: website !== undefined ? website : cafe.contact.website
      },
      averageBudget: {
        min: minBudget ? parseFloat(minBudget) : cafe.averageBudget.min,
        max: maxBudget ? parseFloat(maxBudget) : cafe.averageBudget.max
      },
      amenities: amenities ? JSON.parse(amenities) : cafe.amenities,
      hours: hours ? JSON.parse(hours) : cafe.hours
    };

    const updatedCafe = await Cafe.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email phone');

    res.json({
      message: 'Cafe updated successfully',
      cafe: updatedCafe
    });
  } catch (error) {
    console.error('Update cafe error:', error);
    res.status(500).json({ message: 'Server error during cafe update' });
  }
});

// Delete cafe (Owner only)
router.delete('/:id', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    // Check if the user owns this cafe
    if (cafe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this cafe' });
    }

    // Delete associated images
    if (cafe.images && cafe.images.length > 0) {
      cafe.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    await Cafe.findByIdAndDelete(req.params.id);
    await Rating.deleteMany({ cafe: req.params.id });

    res.json({ message: 'Cafe deleted successfully' });
  } catch (error) {
    console.error('Delete cafe error:', error);
    res.status(500).json({ message: 'Server error during cafe deletion' });
  }
});

// Get owner's cafes
router.get('/owner/my-cafes', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const cafes = await Cafe.find({ owner: req.user._id })
      .populate('owner', 'name')
      .sort({ createdAt: -1 });

    res.json(cafes);
  } catch (error) {
    console.error('Get owner cafes error:', error);
    res.status(500).json({ message: 'Server error while fetching owner cafes' });
  }
});

// Add menu item to cafe
router.post('/:id/menu', authMiddleware, ownerMiddleware, upload.single('image'), async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    // Check if the user owns this cafe
    if (cafe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this cafe' });
    }

    const { name, description, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const menuItem = {
      name,
      description: description || '',
      price: parseFloat(price),
      category,
      image
    };

    cafe.menu.push(menuItem);
    await cafe.save();

    res.json({
      message: 'Menu item added successfully',
      menuItem: cafe.menu[cafe.menu.length - 1]
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ message: 'Server error while adding menu item' });
  }
});

// Update menu item
router.put('/:id/menu/:menuId', authMiddleware, ownerMiddleware, upload.single('image'), async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    // Check if the user owns this cafe
    if (cafe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this cafe' });
    }

    const menuItem = cafe.menu.id(req.params.menuId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    const { name, description, price, category } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : menuItem.image;

    menuItem.name = name || menuItem.name;
    menuItem.description = description !== undefined ? description : menuItem.description;
    menuItem.price = price ? parseFloat(price) : menuItem.price;
    menuItem.category = category || menuItem.category;
    menuItem.image = image;

    await cafe.save();

    res.json({
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: 'Server error while updating menu item' });
  }
});

// Delete menu item
router.delete('/:id/menu/:menuId', authMiddleware, ownerMiddleware, async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
      return res.status(404).json({ message: 'Cafe not found' });
    }

    // Check if the user owns this cafe
    if (cafe.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this cafe' });
    }

    const menuItem = cafe.menu.id(req.params.menuId);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    // Delete image file if exists
    if (menuItem.image) {
      const imagePath = path.join(__dirname, '..', menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    cafe.menu.pull(req.params.menuId);
    await cafe.save();

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ message: 'Server error while deleting menu item' });
  }
});

module.exports = router;