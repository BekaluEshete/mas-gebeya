const Cart = require('../models/Cart');
const User = require('../models/User');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming auth middleware sets req.user

    const cart = await Cart.findOne({ user: userId })
      .populate('items.product')
      .lean();

    if (!cart) {
      return res.status(200).json({
        status: 'success',
        data: { items: [] },
      });
    }

    res.status(200).json({
      status: 'success',
      data: { items: cart.items },
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch cart',
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, productType, quantity = 1 } = req.body;

    // Validate productType
    if (!['Car', 'Property', 'Land', 'Machine'].includes(productType)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid product type',
      });
    }

    // Verify product exists
    const ItemModel = require(`../models/${productType}`);
    const product = await ItemModel.findById(productId);
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    // Check if item already in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.productType === productType
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, productType, quantity });
    }

    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Item added to cart',
      data: { items: cart.items },
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add item to cart',
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, productType, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be at least 1',
      });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found',
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.productType === productType
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        status: 'error',
        message: 'Item not found in cart',
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart item updated',
      data: { items: cart.items },
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update cart item',
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, productType } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found',
      });
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.productType === productType)
    );

    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart',
      data: { items: cart.items },
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to remove item from cart',
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart not found',
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared successfully',
      data: { items: [] },
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to clear cart',
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};