const express = require("express");
const router = express.Router();
const multer = require('multer');


// import custom config
const upload = require('../middlewares/upload');

// import middlewares
const { authentication, isAdmin, customerAuth } = require('../middlewares/authetication');


// import controllers
const { getBooks, deleteBook, addBook, getOneBook, updateBook, addRating, addBookmark, getBookMark, purchasedBook, getPurchasedBook, removeUserBookmark, removeUserPurchasedBook, bestSelling, popularBooks } = require('../controllers/books.controller');


// Get request
router.get('/', getBooks);
router.get('/popular', popularBooks);
router.get('/bestselling', bestSelling);
router.get('/:bookId', getOneBook);
router.get('/user/bookmark', customerAuth, getBookMark);
router.get('/user/purchase', customerAuth, getPurchasedBook);

// post request
router.post('/', isAdmin, upload, addBook);

// patch request
router.patch('/:bookId', isAdmin, updateBook);
router.patch('/:bookId/bookmark', customerAuth, addBookmark);
router.patch('/:bookId/rating', addRating);
router.patch('/:bookId/purchase', customerAuth, purchasedBook)
router.patch('/:bookmarkId/bookmark', customerAuth, removeUserBookmark);
router.patch('/:purchasedId/purchase', isAdmin, removeUserPurchasedBook);

// delete request
router.delete('/:bookId', isAdmin, deleteBook);



module.exports = router;




