const axios = require('axios');
const jwt = require('jsonwebtoken');
const { oauth2Client } = require('../utils/googleClient');
const User = require('../DB/models/User');


exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    try {
        console.log("ergeerg",code);
        const googleRes = await oauth2Client.getToken(code);
        console.log("ergeerg",googleRes);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );       

        const { email, name, picture } = userRes.data;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
            });
        }
        const { _id } = user;
        const token = jwt.sign({ _id, email },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        console.log("swfgwgwgwrwgw");


        
        res.status(200).json({
            message: 'success',
            token,
            user,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};