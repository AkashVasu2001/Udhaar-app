const express = require('express');
const router = express.Router();
const friendController = require('./Controllers/friend_controllers');
const expenseController = require('./Controllers/expense_controller');
const groupController = require('./Controllers/group_controller');
const { googleAuth } = require('./Controllers/auth_controller');

router.get('/google', googleAuth);
router.get('/expenses', expenseController.getExpenses);
router.get('/expenses/group/:groupId', expenseController.getExpensesByGroupId);
router.post('/expenses/friend', expenseController.getExpensesByFriendId); // Change to POST and remove friendId from params
router.get('/friends/balance', friendController.getFriendsWithBalances);
router.post('/expense/add', expenseController.createExpense);
router.get('/friends', friendController.getFriends);
router.post('/friends/add', friendController.addFriend);
router.get('/groups', groupController.getGroups);
router.post('/groups/add', groupController.addMember);
router.get('/group/:groupId', groupController.getGroup);
router.post('/group/create', groupController.createGroup);
router.get('/group/member', groupController.getGroupMembers);
router.post('/settleup', expenseController.settleExpense);

module.exports = router;
