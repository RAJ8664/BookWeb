const mongoose =  require('mongoose');

const orderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    address: {
        city: {
            type: String,
            required: true,
        },
        country: String,
        state: String,
        zipcode: String,
    },
    phone: {
        type: Number,
        required: true,
    },
    productIds:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true,
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'PayPal'],
        default: 'Cash on Delivery'
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    refundedAt: {
        type: Date,
        default: null
    },
    refundReason: {
        type: String,
        default: null
    },
    shippingMethod: {
        type: String,
        enum: ['Standard', 'Express', 'Overnight'],
        default: 'Standard'
    },
    specialInstructions: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
})

const Order =  mongoose.model('Order', orderSchema);

module.exports = Order;