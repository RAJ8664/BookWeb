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
    products: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        title: String,
        price: Number,
        quantity: {
            type: Number,
            default: 1
        }
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_processing', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Credit Card', 'Debit Card', 'PayPal', 'eSewa'],
        default: 'Cash on Delivery'
    },
    paymentReference: {
        method: String,
        transactionId: String,
        referenceId: String,
        status: {
            type: String,
            enum: ['initiated', 'pending', 'complete', 'canceled', 'failed', 'refunded', 'completed'],
            default: 'initiated'
        },
        completedAt: Date,
        updatedAt: Date
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