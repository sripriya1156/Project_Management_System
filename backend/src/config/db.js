const mongoose = require('mongoose')
const connectdb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('DataBase connected');
        console.log('DB NAME:', mongoose.connection.name);
    }
    catch (error) {
        console.log(error);
        process.exit(1);
    }

}
module.exports = connectdb;