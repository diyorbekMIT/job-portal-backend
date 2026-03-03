 const mongoose = require('mongoose');
 const bcrypt = require('bcryptjs');
const e = require('express');

 const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['jobseeker', 'employer'],
        required: true,
    },
    avatar: String,
    resume: String,

    //for employer
    companyname: String,
    companyDescription: String,
    companyLogo: String
 }, {timestamps: true})

 userSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next()
 })

 userSchema.methods.matchPassowr = async function (enteredPassoword) {
    return bcrypt.compare(enteredPassoword, this.password)
 }

 module.exports = mongoose.model('User', userSchema)