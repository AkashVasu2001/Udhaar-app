const Expense = require('../DB/models/Expenses');
const Lent = require('../DB/models/Lent'); // Add this line to require the Lent model
const mongoose = require('mongoose');

const createExpense = async (req, res) => {
    try {
        console.log(req.body);
        const userId = req.headers['userid'];
        const { lenderId, borrowerDetails, groupId, friendId, amount, title } = req.body; // Getting data from the request body
        if (!lenderId || !borrowerDetails || !amount || !userId || !(groupId || friendId)) {
            return res.status(400).json({ message: "Required fields are missing" });
        }
        

        const newExpense = new Expense({
            lenderId,
            borrowerDetails,
            groupId,
            friendId,
            amount,
            title,
        });

        await newExpense.save();
        const lentRecord = await Lent.findOne({ lenderId: lenderId });
        if (lentRecord) {
            // Update existing Lent record
            borrowerDetails.forEach(async (borrower) => {
                const existingBorrower = lentRecord.borrowers.find(b => b.borrowerId.toString() === borrower.borrowerId.toString());
                if (existingBorrower) {
                    existingBorrower.amountLent += borrower.amountLent;
                } else {
                    lentRecord.borrowers.push({
                        borrowerId: borrower.borrowerId,
                        groupId: groupId,
                        friendId: friendId,
                        amountLent: borrower.amountLent
                    });
                            }
            });
            await lentRecord.save();
        } else {
            const newLentRecord = new Lent({
                lenderId: lenderId,
                borrowers: borrowerDetails.map(borrower => ({
                    borrowerId: borrower.borrowerId,
                    groupId: groupId,
                    friendId: friendId,
                    amountLent: borrower.amountLent
                }))
            });
            await newLentRecord.save();
        }

        return res.status(201).json({ message: "Expense created", expense: newExpense });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

const getExpenses = async (req, res) => {
    try {
        const userId = req.headers['userid'];
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const oweExpenses = await Expense.find({
            lenderId: { $ne: OuserId },
            borrowerDetails: {
                $elemMatch: {
                    borrowerId: OuserId,
                    paid: false,
                },
            },
        }).populate([
            { path: 'lenderId', select: 'name' },
            { path: 'borrowerDetails.borrowerId', select: 'name' },
            { path: 'groupId', select: 'name dp' },
            {
                path: 'friendId',
                select: 'name image'
            },
        ]);

        const processedOweExpenses = oweExpenses.map((expense) => {
            expense.friendDetails = {
                name: expense.friendId?.name,
                userId: expense.friendId?._id
            };

            return expense.toObject();
        });
        const unpaidOweExpenses = processedOweExpenses.filter(expense => 
            expense.borrowerDetails.some(borrower => !borrower.paid)
        );
        let totalOwe = 0;
        unpaidOweExpenses.forEach((expense) => {
            expense.borrowerDetails.forEach((borrowerDetail) => {
                console.log(!borrowerDetail.paid, borrowerDetail.paid)
                console.log( borrowerDetail.borrowerId.toString() === userId.toString())
                if (!borrowerDetail.paid && borrowerDetail.borrowerId.toString() === userId.toString()) {
                    totalOwe += borrowerDetail.amountLent;
                }
            });
        });
        
        const lentExpenses = await Expense.find({
            lenderId: OuserId,
            borrowerDetails: {
                $elemMatch: { paid: false },
            },
        }).populate([
            { path: 'lenderId', select: 'name' },
            { path: 'borrowerDetails.borrowerId', select: 'name' },
            { path: 'groupId', select: 'name dp' },
            {
                path: 'friendId',
                select: 'name image' // Select the friend's name
            },
        ]);

        const processedLentExpenses = lentExpenses.map((expense) => {
            // Populate the friend's name and userId
            expense.friendDetails = {
                name: expense.friendId?.name,
                userId: expense.friendId?._id
            };

            return expense.toObject(); // Convert to plain JavaScript object
        });
        const unpaidLentExpenses = processedLentExpenses.filter(expense => 
            expense.borrowerDetails.some(borrower => !borrower.paid)
        );
        let totalLent = 0;
        unpaidLentExpenses.forEach((expense) => {
            expense.borrowerDetails.forEach((borrowerDetail) => {
                if (!borrowerDetail.paid) {
                    totalLent += borrowerDetail.amountLent;
                }
            });
        });

        let result = {
            owe: {
                expenses: processedOweExpenses,
                totalOwed: totalOwe,
            },
            lent: {
                expenses: processedLentExpenses,
                totalLent: totalLent,
            },
        };

        return res.status(200).json({ message: 'success', data: result });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};

const getExpensesByGroupId = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.headers['userid'];
        
        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required" });
        }

        if (!mongoose.isValidObjectId(groupId)) {
            return res.status(400).json({ message: "Invalid Group ID" });
        }

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const expenses = await Expense.find({ groupId: groupId }).populate([
            { path: 'lenderId', select: 'name' },
            { path: 'borrowerDetails.borrowerId', select: 'name' },
            { path: 'groupId', select: 'name' },
            {
                path: 'friendId',
                select: 'name'
            },
        ]);
        const unpaidExpenses = expenses.filter(expense => 
            expense.borrowerDetails.some(borrower => !borrower.paid)
        );
        return res.status(200).json({ message: 'success', data: unpaidExpenses });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};

const getExpensesByFriendId = async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.headers['userid'];
        
        if (!friendId) {
            return res.status(400).json({ message: "Friend ID is required" });
        }

        if (!mongoose.isValidObjectId(friendId)) {
            return res.status(400).json({ message: "Invalid Friend ID" });
        }

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const expenses = await Expense.find({
            $or: [
                { lenderId: OuserId, 'borrowerDetails.borrowerId': friendId },
                { lenderId: friendId, 'borrowerDetails.borrowerId': OuserId }
            ]
        }).populate([
            { path: 'lenderId', select: 'name' },
            { path: 'borrowerDetails.borrowerId', select: 'name' },
            { path: 'groupId', select: 'name' },
            {
                path: 'friendId',
                select: 'name' 
            },
        ]);
        const unpaidExpenses = expenses.filter(expense => 
            expense.borrowerDetails.some(borrower => !borrower.paid)
        );
        return res.status(200).json({ message: 'success', data: unpaidExpenses });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};
const settleExpense = async (req, res) => {
    try {
        const userId = req.headers['userid'];
        const { friendId, groupId, userId2 } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!friendId && !groupId) {
            return res.status(400).json({ message: "Either Friend ID or Group ID is required" });
        }

        if (groupId && !userId2) {
            return res.status(400).json({ message: "User ID 2 is required for group settlement" });
        }

        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        const OfriendId = friendId && mongoose.isValidObjectId(friendId) ? new mongoose.Types.ObjectId(friendId) : null;
        const OgroupId = groupId && mongoose.isValidObjectId(groupId) ? new mongoose.Types.ObjectId(groupId) : null;
        const OuserId2 = userId2 && mongoose.isValidObjectId(userId2) ? new mongoose.Types.ObjectId(userId2) : null;

        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        if (friendId && !OfriendId) {
            return res.status(400).json({ message: "Invalid Friend ID" });
        }

        if (groupId && !OgroupId) {
            return res.status(400).json({ message: "Invalid Group ID" });
        }



        if (userId2 && !OuserId2) {
            return res.status(400).json({ message: "Invalid User ID  2" });
        }

        let updateQuery;
        if (OfriendId) {
            updateQuery = {
                $or: [
                    { lenderId: OuserId, 'borrowerDetails.borrowerId': OfriendId },
                    { lenderId: OfriendId, 'borrowerDetails.borrowerId': OuserId }
                ]
            };
        } else if (OgroupId) {
            updateQuery = {
                'borrowerDetails.groupId': OgroupId,
                $or: [
                    { lenderId: OuserId, 'borrowerDetails.borrowerId': OuserId2 },
                    { lenderId: OuserId2, 'borrowerDetails.borrowerId': OuserId }
                ]
            };
        }

        await Expense.updateMany(
            updateQuery,
            { $set: { 'borrowerDetails.$[elem].paid': true } },
            { arrayFilters: [{ 'elem.borrowerId': { $in: [OuserId, OfriendId, OuserId2] } }] }
        );

        
        await Lent.updateMany(
            {
                lenderId: { $in: [OuserId, OfriendId, OuserId2] },
                'borrowers.borrowerId': { $in: [OuserId, OfriendId, OuserId2] }
            },
            { $set: { 'borrowers.$[elem].amountLent': 0 } },
            { arrayFilters: [{ 'elem.borrowerId': { $in: [OuserId, OfriendId, OuserId2] } }] }
        );

        return res.status(200).json({ message: "Expenses settled successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




module.exports = {
    createExpense,
    getExpenses,
    getExpensesByGroupId,
    getExpensesByFriendId,
    settleExpense
};
