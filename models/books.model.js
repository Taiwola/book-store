const mongoose = require('mongoose');

const BookSchema = mongoose.Schema({
  image: {
    data: Buffer,
    contentType: String
  },
  title: { type: String, required: true },
  price: { type: String, required: true },
  authorName: { type: String, required: true },
  rating: { type: Number, default: 3 },
  ratingCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 }
});

BookSchema.methods.rateBook = function (rating) {
  const prevRatingTotal = this.rating * this.ratingCount;
  this.ratingCount++;
  this.rating = (prevRatingTotal + rating) / this.ratingCount;
  return {
    rating: this.rating,
    ratingCount: this.ratingCount
  };
};

BookSchema.methods.format = function () {
  return {
    id: this._id,
    title: this.title,
    price: this.price,
    authorName: this.authorName,
    image: this.image,
    rating: this.rating,
    salesCount: this.salesCount
  }
}



const Book = mongoose.model('Book', BookSchema);



module.exports = Book;




