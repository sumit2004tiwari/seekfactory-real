import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      country,
      status = 'active'
    } = req.query;

    const query = { status, isActive: true };

    // Add filters
    if (category) query.category = category;
    if (country) query.countryOfOrigin = country;
    if (search) {
      query.$text = { $search: search };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: {
        path: 'supplier',
        select: 'name companyName isVerified'
      },
      sort: { createdAt: -1 }
    };

    const products = await Product.find(query)
      .populate('supplier', 'name companyName isVerified')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplier', 'name companyName isVerified phone email address');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment views (don't await to avoid slowing response)
    product.incrementViews().catch(console.error);

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Supplier only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      priceRange,
      minOrderQuantity,
      countryOfOrigin,
      tags,
      certifications,
      images
    } = req.body;

    // Check if user is supplier
    if (req.user.role !== 'supplier') {
      return res.status(403).json({
        success: false,
        message: 'Only suppliers can create products'
      });
    }

    const product = await Product.create({
      name,
      description,
      category,
      priceRange,
      minOrderQuantity,
      countryOfOrigin,
      tags: tags || [],
      certifications,
      images: images || [],
      supplier: req.user.id
    });

    await product.populate('supplier', 'name companyName isVerified');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Supplier who owns the product)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product or is admin
    if (product.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const {
      name,
      description,
      category,
      priceRange,
      minOrderQuantity,
      countryOfOrigin,
      tags,
      certifications,
      images,
      status
    } = req.body;

    // Update fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (priceRange) product.priceRange = priceRange;
    if (minOrderQuantity) product.minOrderQuantity = minOrderQuantity;
    if (countryOfOrigin) product.countryOfOrigin = countryOfOrigin;
    if (tags) product.tags = tags;
    if (certifications) product.certifications = certifications;
    if (images) product.images = images;
    if (status && req.user.role === 'admin') product.status = status;

    await product.save();
    await product.populate('supplier', 'name companyName isVerified');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Supplier who owns the product)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product or is admin
    if (product.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

// @desc    Get supplier's products
// @route   GET /api/products/my-products
// @access  Private (Supplier only)
export const getMyProducts = async (req, res) => {
  try {
    const { page = 1, limit = 12, status } = req.query;

    const query = { 
      supplier: req.user.id,
      isActive: true
    };

    if (status) query.status = status;

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your products'
    });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};
