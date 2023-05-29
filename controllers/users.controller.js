// models
const Users = require("../models/users.model");

// user get request
const handleGetUsers = async (req, res) => {
  const users = await Users.find();
  res.status(200).json({ data: users });
};

// delete request
const handleDelete = async (req, res) => {
  try {
    const result = await Users.deleteMany();
    res.status(200).json({
      message: `${result.deletedCount} users deleted successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { handleGetUsers, handleDelete };
