// library/modules
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { title } = require("process");


// models
const Book = require("../models/books.model");
const Customer = require("../models/customer.model");

// helper functions

// define const 


const addBook = async (req, res) => {
  const { title, price, authorName } = req.body;
  const image = {
    data: req.file.buffer,
    contentType: req.file.mimetype,
  };

  if (!title || !price || !authorName) {
    return res
      .status(422)
      .json({ success: false, message: "Incomplete payload" });
  }

  const newBook = new Book({ image, title, price, authorName });

  try {
    await newBook.save();
  } catch (err) {
    console.log("user not added " + err);
    res.status(400).json({ error: err.message });
  }

  res.status(201).json({ succes: true, message: "new book added" });
};

const getBooks = async (req, res) => {
  const books = await Book.find();
  const response = books.map((book) => book.format());
  res.status(200).json({ data: response });
};

const getOneBook = async (req, res) => {
  const bookId = req.params.bookId;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId))
    return res
      .status(400)
      .json({ succes: false, message: "Request does not exist" });

  const book = await Book.findById(bookId);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res
    .status(200)
    .json({ success: true, message: "Book found", data: book.format() });
};

const updateBook = async (req, res) => {
  const bookId = req.params.bookId;
  const { title, price } = req.body;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ success: false, message: "Invalid book ID" });
  }

  if (!title && !price)
    return res.status(400).json({ succes: false, message: "missing field" });

  const filter = { _id: bookId };
  const update = { title, price };

  let book;
  try {
    book = await Book.findOneAndUpdate(filter, update, { new: true });
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Error updating book" });
  }

  res
    .status(200)
    .json({ success: true, message: "Book updated", data: book.format() });
};

const deleteBook = async (req, res) => {
  const { bookId } = req.params;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId))
    res.status(400).json({ succes: false, message: "Request does not exist" });

  try {
    await Book.deleteOne({ bookId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
  res.status(200).json({
    message: `book deleted successfully`,
  });
};

// Define the book controller function
const addRating = async (req, res) => {
  const bookId = req.params.bookId;
  const rating = req.body.rating;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId))
    res.status(400).json({ succes: false, message: "Request does not exist" });

  // If no rating or if ratingis number;
  if (!rating) {
    return res.status(400).json({ success: false, message: "Bad Request" });
  }

  // Find the book by ID
  const book = await Book.findById(bookId);
  if (!book) {
    return res
      .status(404)
      .json({ success: false, message: `Book with ID ${bookId} not found` });
  }

  const { rating: updatedRating, ratingCount } = book.rateBook(
    parseInt(rating)
  );

  // Call the rateBook method on the book instance
  if (!updatedRating) return res.sendStatus(400);

  try {
    // Save the updated book to the database
    await book.save();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
  // Return a success response with the updated rating and rating count
  res
    .status(200)
    .json({
      success: true,
      message: "Rating added",
      data: { rating: updatedRating, ratingCount, book },
    });
};

const addBookmark = async (req, res) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { bookmark } = req.body;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId) || !bookmark)
    return res
      .status(400)
      .json({ succes: false, message: "Request does not exist" });

  const book = await Book.findById(bookId);
  if (!book) {
    return res
      .status(404)
      .json({ success: false, message: `Book with ID ${bookId} not found` });
  }

  const customer = await Customer({
    customer: user._id,
    book: bookId,
    bookmark,
  });

  try {
    await customer.save();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }

  res
    .status(200)
    .json({ success: true, message: "Bookmark added", data: { customer } });
};

const getBookMark = async (req, res) => {
  const user = req.user;
  const userId = user._id;

  const bookMark = await Customer.find({
    customer: userId,
    bookmark: true,
  }).populate("book");

  const books = bookMark.map((bookmark) => {
    return bookmark.book;
  });

  res.status(200).json({ data: books });
};

const removeUserBookmark = async (req, res) => {
  const bookmarkId = req.params.bookmarkId;
  const userId = req.user._id;

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "user does not exist" });

  if (!bookmarkId || !mongoose.Types.ObjectId.isValid(bookmarkId))
    return res
      .status(400)
      .json({ success: false, message: "Request does not exist" });

  try {
    await Customer.findOneAndUpdate(
      { _id: userId },
      { bookmark: false },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }

  res
    .status(200)
    .json({ success: true, message: "Bookmark successfully removed" });
};

const purchasedBook = async (req, res) => {
  const bookId = req.params.bookId;
  const user = req.user;
  const { purchased } = req.body;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId))
    return res
      .status(400)
      .json({ succes: false, message: "Request does not exist" });

  if (!user || !purchased)
    return res.status(400).json({ succes: "false", message: "bad request" });

  const book = await Book.findOne({ bookId });

  if (!book)
    return res
      .status(404)
      .json({ success: false, message: `Book with ID ${bookId} not found` });

  const customer = await Customer({
    customer: user._id,
    book: bookId,
    purchased,
  });

  book.salesCount++;

  try {
    await customer.save();
    await book.save();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }

  res
    .status(200)
    .json({ success: "true", message: "purchase added", data: customer });
};

const getPurchasedBook = async (req, res) => {
  const user = req.user;
  const userId = user._id;

  const purchasedBook = await Customer.find({
    customer: userId,
    purchased: true,
  }).populate("book");

  const book = purchasedBook.map((purchased) => {
    return purchased.book;
  });

  res.status(200).json({ data: book });
};

const removeUserPurchasedBook = async (req, res) => {
  const purchasedId = req.params.purchasedId;
  const userId = req.user._id;

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "user does not exist" });

  if (!purchasedId || !mongoose.Types.ObjectId.isValid(purchasedId))
    return res
      .status(400)
      .json({ success: false, message: "request does not exist" });

  try {
    await Customer.findOneAndUpdate(
      { _id: userId },
      { purchased: false },
      { new: true }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "server error" });
  }
  res.status(200).json({ message: "request successfully removed" });
};

const bestSelling = async (req, res) => {
  const bestSelling = await Book.find({}).sort({ salesCount: -1 }).exec();
  console.log(bestSelling);
  res.status(200).json({ succes: true, data: bestSelling });
};

const popularBooks = async (req, res) => {
  const popularBooks = await Book.find({}).sort({ rating: -1 }).exec();
  console.log(popularBooks);
  res.status(200).json({ sucess: true, data: popularBooks });
};

module.exports = {
  getBooks,
  deleteBook,
  addBook,
  getOneBook,
  updateBook,
  addRating,
  addBookmark,
  getBookMark,
  purchasedBook,
  getPurchasedBook,
  removeUserBookmark,
  removeUserPurchasedBook,
  bestSelling,
  popularBooks,
};
