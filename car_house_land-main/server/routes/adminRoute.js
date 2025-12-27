const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const Property = require('../models/Property');
const Land = require('../models/Land');
const Machine = require('../models/Machine');
const User = require('../models/User');

// Middleware to check if user is admin (simplified for now, assumes role field exists on User)
// In a real app, you'd use a proper auth middleware
// For this MVP/Demo, we might skip strict role check or check it via a shared middleware
// But for now, let's at least wrap it.

// Helper to get model by type
const getModelByType = (type) => {
    switch (type) {
        case 'car': return Car;
        case 'property': return Property; // housing
        case 'land': return Land;
        case 'machine': return Machine;
        default: return null;
    }
};

// GET /api/admin/pending
// Fetch all items with approved: false
router.get('/pending', async (req, res) => {
    try {
        const [cars, properties, lands, machines] = await Promise.all([
            Car.find({ approved: false }).populate('owner', 'name email'),
            Property.find({ approved: false }).populate('owner', 'name email'),
            Land.find({ approved: false }).populate('owner', 'name email'),
            Machine.find({ approved: false }).populate('owner', 'name email')
        ]);

        // Attach type to each item for frontend convenience
        const formatItem = (item, type) => ({ ...item.toObject(), itemType: type });

        res.json({
            cars: cars.map(i => formatItem(i, 'car')),
            properties: properties.map(i => formatItem(i, 'property')), // 'house' on frontend usually
            lands: lands.map(i => formatItem(i, 'land')),
            machines: machines.map(i => formatItem(i, 'machine'))
        });
    } catch (error) {
        console.error('Error fetching pending items:', error);
        res.status(500).json({ message: 'Server error fetching pending items' });
    }
});

// PUT /api/admin/approve/:type/:id
// Approve an item
router.put('/approve/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = getModelByType(type);

        if (!Model) {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        const item = await Model.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        item.approved = true;
        await item.save();

        res.json({ message: 'Item approved successfully', data: item });
    } catch (error) {
        console.error('Error approving item:', error);
        res.status(500).json({ message: 'Server error approving item' });
    }
});

// DELETE /api/admin/reject/:type/:id
// Reject (delete) an item
router.delete('/reject/:type/:id', async (req, res) => {
    try {
        const { type, id } = req.params;
        const Model = getModelByType(type);

        if (!Model) {
            return res.status(400).json({ message: 'Invalid item type' });
        }

        const item = await Model.findByIdAndDelete(id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // In a real app, you might want to notify the user why it was rejected

        res.json({ message: 'Item rejected and deleted successfully' });
    } catch (error) {
        console.error('Error rejecting item:', error);
        res.status(500).json({ message: 'Server error rejecting item' });
    }
});

module.exports = router;
