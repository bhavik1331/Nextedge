import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Member from './src/members/member.model.js';

dotenv.config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        await Member.deleteMany({});
        console.log('Successfully deleted all members');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

clearDB();
