const additionsModel = require("../models/additions");

exports.getAdditions = async (req, res) => {
  try {
    const additions = await additionsModel.find();
    res.status(200).json({ additions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addAddition = async (req, res) => {
  const { name, price } = req.body;
  try {
    const newAddition = new additionsModel({ name, price });
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
  const { name, price } = req.body;
  try {
    const updatedAddition = await additionsModel.findByIdAndUpdate(
      req.params.id,
      { name, price },
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
