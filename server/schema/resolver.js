const { AuthenticationError } = require('apollo-server');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    //query 
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id }).select('-__v-password');
                return userData;
            }
            throw new AuthenticationError('You must be logged in to view this data');
        },
    },

    //mutations 

    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('unknown user');
            }
            const correctPassword = await user.isCorrectPassword(password);

            if (!correctPassword) {
                throw new AuthenticationError('incorrect password');
            }
            const taken = signToken(user);
            return { token, user }
        },
        saveBook: async (parent, { bookData }, conext) => {
            if (context.user) {
                const updateUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true }
                );
                return updateUser;
            }
            throw new AuthenticationError('You must be logged in to save a book');
        },
        removeBook: async (parent, { boodId }, conext) => {
            if (context.user) {
                updatedUser = await User.FindOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return updatedUser;
            }
            throw new AuthenticationError('You must be logged in to remove a book');
        },
    },
};

module.exports = resolvers;