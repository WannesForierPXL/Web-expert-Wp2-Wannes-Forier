const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mockingoose = require('mockingoose');
const User = require('../../models/userModel');
const userService = require('../../services/userService');

beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
});

describe('userService', () => {
    describe('findAll', () => {
        it('returns all users', async () => {
            const users = [
                new User({username: 'user1', password: 'password1', roles: ['user']}),
                new User({username: 'admin1', password: 'password2', roles: ['admin']})
            ];
            mockingoose(User).toReturn(users, 'find');

            const result = await userService.findAll();

            expect(result).toHaveLength(2);
            expect(result.map((u) => u.username)).toEqual(['user1', 'admin1']);
        });

        it('returns an empty array when there are no users', async () => {
            mockingoose(User).toReturn([], 'find');

            const result = await userService.findAll();

            expect(result).toEqual([]);
        });
    });
});