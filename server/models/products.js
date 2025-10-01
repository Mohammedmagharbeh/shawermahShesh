const moongoose = require("mongoose");
const { CATEGORIES } = require("../constants");

const productShcsema = new moongoose.Schema({
  name: { type: String, require: true },
  price: { type: Number, require: true },
   discount: {  type: Number, default: 0, min: 0,max: 100 },
  image: { type: String, require: true },
  category: { type: String, enum: CATEGORIES, require: true },
  description: { type: String, require: true },
});



const products = moongoose.model("product", productShcsema);
module.exports = products;