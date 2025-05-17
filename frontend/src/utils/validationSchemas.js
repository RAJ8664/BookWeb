import { z } from 'zod';

// User registration schema
export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Login schema
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});

// Admin login schema
export const adminLoginSchema = z.object({
  username: z.string()
    .min(1, 'Username is required'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

// Contact form schema
export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name is required')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  confirmEmail: z.string()
    .email('Please enter a valid email address'),
  address: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string()
    .min(3, 'Subject is required')
    .max(100, 'Subject cannot exceed 100 characters'),
  issueType: z.string(),
  message: z.string()
    .min(20, 'Message should be at least 20 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),
}).refine(data => data.email === data.confirmEmail, {
  message: "Emails don't match",
  path: ['confirmEmail'],
});

// Checkout form schema
export const checkoutSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'Province is required'),
  zipcode: z.string().regex(/^[0-9]{5,10}$/, 'Please enter a valid zipcode'),
  country: z.string().min(1, 'Country is required'),
  paymentMethod: z.string().min(1, 'Please select a payment method'),
});

// Book form schema
export const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description should be at least 10 characters long'),
  price: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a valid positive number',
  }),
  language: z.string().optional(),
  publishedDate: z.string().optional(),
  rating: z.string().optional(),
  trending: z.boolean().optional(),
  recommended: z.boolean().optional(),
  newArrival: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  awardWinner: z.boolean().optional(),
  inStock: z.boolean().optional(),
});

// Profile update schema
export const profileUpdateSchema = z.object({
  displayName: z.string().min(3, 'Display name must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address').optional(),
  password: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  // If new password is provided, it should meet the requirements
  if (data.newPassword) {
    return data.newPassword.length >= 8;
  }
  return true;
}, {
  message: 'New password must be at least 8 characters',
  path: ['newPassword'],
}).refine(data => {
  // If new password is provided, confirm password should match
  if (data.newPassword) {
    return data.newPassword === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Book request schema
export const bookRequestSchema = z.object({
  title: z.string().min(1, 'Book title is required'),
  author: z.string().min(1, 'Author name is required'),
  description: z.string().min(10, 'Please provide a brief description'),
  reason: z.string().min(10, 'Please explain why you want this book'),
  email: z.string().email('Please enter a valid email address'),
}); 