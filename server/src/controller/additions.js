const additionsModel = require("../models/additions");

exports.getAdditions = async (req, res) => {
  try {
    const additions = await additionsModel.find();
    res.status(200).json({ additions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAdditionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res
        .status(400)
        .json({ message: "Category parameter is required" });
    }

    const additions = await additionsModel.find({ category });
    res.status(200).json({ additions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addAddition = async (req, res) => {
  const { name, price, category } = req.body;
  try {
    const newAddition = new additionsModel({
      name,
      price,
      category,
    });
    await newAddition.save();
    res.status(201).json(newAddition);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteAddition = async (req, res) => {
  try {
    const deletedAddition = await additionsModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedAddition) {
      return res.status(404).json({ message: "Addition not found" });
    }
    res.status(200).json({ message: "Addition deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateAddition = async (req, res) => {
  const { name, price, category } = req.body;
  try {
    const updatedAddition = await additionsModel.findByIdAndUpdate(
      req.params.id,
      { name, price, category },
      { new: true }
    );
    if (!updatedAddition) {
      return res.status(404).json({ message: "Addition not found" });
    }
    res.status(200).json(updatedAddition);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
