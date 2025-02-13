const User = require('../DB/models/User');
const mongoose = require('mongoose');
const Lent = require('../DB/models/Lent'); // Ensure you have the Lent model

const getFriends = async (req, res) => {
    try {
        const userId = req.headers['userid'];
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const user = await User.findById(OuserId).populate('friends.friendId', 'name image');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const friends = user.friends.map(friend => ({
            friendId: friend.friendId._id,
            name: friend.friendId.name,
            dp: friend.friendId.dp
        }));

        return res.status(200).json({ message: 'success', data: friends });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};

const getFriendsWithBalances = async (req, res) => {
    try {
        const userId = req.headers['userid'];
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const user = await User.findById(OuserId).populate('friends.friendId', 'name image');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const friendsWithBalances = await Promise.all(user.friends.map(async (friend) => {
            const friendId = friend.friendId._id;

            const lentRecords = await Lent.find({ lenderId: OuserId, 'borrowers.borrowerId': friendId });
            const borrowedRecords = await Lent.find({ lenderId: friendId, 'borrowers.borrowerId': OuserId });

            const totalLentToFriend = lentRecords.reduce((sum, record) => {
                const borrower = record.borrowers.find(b => b.borrowerId.toString() === friendId.toString());
                return sum + (borrower ? borrower.amountLent : 0);
            }, 0);

            const totalLentFromFriend = borrowedRecords.reduce((sum, record) => {
                const borrower = record.borrowers.find(b => b.borrowerId.toString() === OuserId.toString());
                return sum + (borrower ? borrower.amountLent : 0);
            }, 0);

            const balance = totalLentToFriend - totalLentFromFriend;

            return {
                friendId: friendId,
                name: friend.friendId.name,
                dp: friend.friendId.image,
                balance: balance
            };
        }));

        return res.status(200).json({ message: 'success', data: friendsWithBalances });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};

const addFriend = async (req, res) => {
    try {
        const userId = req.headers['userid'];
        const { email } = req.body;
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const friend = await User.findOne({ email: email });
        if (!friend) {
            return res.status(404).json({ message: "Friend not found" });
        }

        // Check if the friend is already in the user's friends list
        if (user.friends.some(f => f.friendId.toString() === friend._id.toString())) {
            return res.status(400).json({ message: "Friend already exists." });
        }

        // Add the friend to the user's friends list
        user.friends.push({ friendId: friend._id });
        await user.save();

        // Add the user to the friend's friends list
        friend.friends.push({ friendId: user._id });
        await friend.save();

        return res.status(201).json({ message: "Friend added." });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};



module.exports = {
    getFriendsWithBalances,
    getFriends,
    addFriend
};