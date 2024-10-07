import Booking from "../models/Bookings.js";
import Stripe from 'stripe';

// Load Stripe secret key from environment variables
const stripe = new Stripe("sk_test_51Q5S1sDGulvCS4dB7sNW8VvI1nXMuHatgIs3GQCs2wXfloL95DXTo004AG1MGZDAJiHcj3zr2JUuDfrNPQoZlg96009pTSef9q");

// Create a new booking and process payment with Stripe
export const createBooking = async (req, res) => {
  const { amount, currency, paymentMethodId, tourDetails } = req.body;

  // Step 1: Validate the incoming request
  if (!amount || !currency || !paymentMethodId || !tourDetails) {
    return res.status(400).json({
      success: false,
      message: "Missing required parameters: amount, currency, paymentMethodId, or tourDetails",
    });
  }

  try {
    

    // Solution 2: Provide a `return_url`
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,  // Convert amount to cents for Stripe
      currency,
      payment_method: paymentMethodId,
      confirm: true,  // Automatically confirm the payment
      return_url: 'https://yourdomain.com/thank-you',  // Replace with your actual return URL
    });

    // Step 3: Save the booking details if payment is successful
    const newBooking = new Booking(tourDetails);
    const savedBooking = await newBooking.save();

    // Step 4: Respond with success message and booking details
    res.status(200).json({
      success: true,
      message: "Your tour is booked, and payment was successful",
      data: savedBooking,
      paymentDetails: paymentIntent,
    });
  } catch (err) {
    // Handle Stripe or internal errors
    res.status(500).json({
      success: false,
      message: "Payment failed or internal server error",
      error: err.message,
    });
  }
};

// Get single booking
export const getBooking = async (req, res) => {
  const id = req.params.id;

  try {
    const book = await Booking.findById(id);

    if (!book) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking retrieved successfully",
      data: book,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get all bookings
export const getAllBooking = async (req, res) => {
  try {
    const books = await Booking.find();

    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: books,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
