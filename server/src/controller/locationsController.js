const locationsModel = require("../models/locations");

exports.getLocations = async (req, res) => {
  try {
    const locations = await locationsModel.find().lean();
    res.status(200).json({ locations });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
exports.getLocationById = async (req, res) => {
  try {
    const location = await locationsModel.findById(req.params.id).lean();
    res.status(200).json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addLocation = async (req, res) => {
  const { name, SECNO, deliveryCost } = req.body;
  try {
    const newLocation = new locationsModel({ name, SECNO, deliveryCost });
    await newLocation.save();
    res.status(201).json(newLocation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
