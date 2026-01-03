const server = require("./app"); // note: fixed path
const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
