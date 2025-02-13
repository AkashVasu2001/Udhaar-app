const mongoose = require('mongoose');
const Group = require('../DB/models/Group');
const User = require('../DB/models/User');
const Lent = require('../DB/models/Lent');

const createGroup = async (req, res) => {
    const { groupName, userIds, groupDescription } = req.body;
    const userId = req.headers['userid'];

    if (!groupName) {
        return res.status(400).json({ message: 'Group name is required.' });
    }

    
    // Add the userId from the header to the userIds array
    userIds.push(userId);

    const objectIdUserIds = userIds.map(id => mongoose.isValidObjectId(id) ? new mongoose.Types.ObjectId(id) : null);
    if (objectIdUserIds.includes(null)) {
        return res.status(400).json({ message: 'Invalid User ID in the array.' });
    }

    const randomImage = Math.floor(Math.random() * 8);

    const newGroup = new Group({
        name: groupName,
        members: objectIdUserIds,
        description: groupDescription,
        dp: randomImage.toString()
    });



    newGroup.save()
        .then(group => res.status(201).json(group))
        .catch(error => res.status(500).json({ message: 'Error creating group', error }));
};

const getGroups = (req, res) => {
    const userId = req.headers['userid'];

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
    if (!OuserId) {
        return res.status(400).json({ message: 'Invalid User ID' });
    }

    Group.find({ members: OuserId })
        .populate('members', 'name')
        .then(groups => res.status(200).json(groups))
        .catch(error => res.status(500).json({ message: 'Error fetching groups', error }));
};

const getGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.headers['userid'];
    console.log(groupId)
    if (!groupId) {
        return res.status(400).json({ message: 'Group ID is required' });
    }

    if (!mongoose.isValidObjectId(groupId)) {
        return res.status(400).json({ message: 'Invalid Group ID' });
    }

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid User ID' });
    }

    try {
        const group = await Group.findById(groupId).populate('members', 'name');
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const lentRecords = await Lent.find({ lenderId: userId, 'borrowers.groupId': groupId });
        const borrowedRecords = await Lent.find({ 'borrowers.borrowerId': userId, 'borrowers.groupId': groupId });

        const members = await Promise.all(group.members.map(async (member) => {
            const lentToMember = lentRecords.reduce((sum, record) => {
                const borrower = record.borrowers.find(b => b.borrowerId.toString() === member._id.toString());
                return sum + (borrower ? borrower.amountLent : 0);
            }, 0);

            const borrowedFromMember = borrowedRecords.reduce((sum, record) => {
                const borrower = record.borrowers.find(b => b.borrowerId.toString() === userId.toString() && record.lenderId.toString() === member._id.toString());
                return sum + (borrower ? borrower.amountLent : 0);
            }, 0);

            const netLentAmount = lentToMember - borrowedFromMember;

            return {
                memberId: member._id,
                name: member.name,
                lentAmount: netLentAmount
            };
        }));

        return res.status(200).json({ message: 'success', data: { ...group.toObject(), members } });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};

const addMember = async (req, res) => {
    try {
        const userId = req.headers['userid'];
        const { userId2, groupId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        if (!userId2) {
            return res.status(400).json({ message: "User ID 2 is required" });
        }
        if (!groupId) {
            return res.status(400).json({ message: "Group ID is required" });
        }
        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }
        const OuserId2 = mongoose.isValidObjectId(userId2) ? new mongoose.Types.ObjectId(userId2) : null;
        if (!OuserId2) {
            return res.status(400).json({ message: "Invalid User ID 2" });
        }
        const OgroupId = mongoose.isValidObjectId(groupId) ? new mongoose.Types.ObjectId(groupId) : null;
        if (!OgroupId) {
            return res.status(400).json({ message: "Invalid Group ID" });
        }
        const group = await Group.findOne({ _id: OgroupId, members: OuserId });
        if (!group) {
            return res.status(404).json({ message: "Group not found or user is not a member of the group" });
        }
        const user2 = await User.findOne({ _id: OuserId2 });
        if (!user2) {
            return res.status(404).json({ message: "User 2 not found" });
        }
        if (group.members.includes(OuserId2)) {
            return res.status(400).json({ message: "User 2 is already a member of the group" });
        }
        group.members.push(OuserId2);
        await group.save();

        return res.status(201).json({ message: "User 2 added to the group" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
}

const getGroupMembers = async (req, res) => {
    try {
        const userId = req.headers['userid'];
        const { groupId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const OuserId = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : null;
        if (!OuserId) {
            return res.status(400).json({ message: "Invalid User ID" });
        }

        const group = await Group.findById(groupId).populate('members', 'name');
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (!group.members.some(member => member._id.toString() === userId.toString())) {
            return res.status(403).json({ message: "User is not a member of the group" });
        }

        const members = group.members.filter(member => member._id.toString() !== userId.toString());

        return res.status(200).json({ message: 'success', data: members });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
};

module.exports = {
    createGroup,
    getGroups,
    getGroup,
    addMember,
    getGroupMembers,
};