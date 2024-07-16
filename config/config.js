const {connect} = require('mongoose');
const {error, success} = require('consola');
const DB = "mongodb://127.0.0.1:27017/Test";

const connectDB = async () =>{
    try{
        await connect(DB);
        success({
            message : `success to connect to DB\n${DB}`,
        })
    } 
    catch (error) {
          console.log(error)

        //call the connectDB
        connectDB()
    }  
};
module.exports = connectDB