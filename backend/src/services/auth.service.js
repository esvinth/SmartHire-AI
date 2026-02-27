const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { jwt: jwtConfig } = require('../config/env');

class AuthService {
  generateAccessToken(userId, role) {
    return jwt.sign({ id: userId, role }, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  }

  generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  }

  generateTokens(userId, role) {
    return {
      accessToken: this.generateAccessToken(userId, role),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  verifyAccessToken(token) {
    return jwt.verify(token, jwtConfig.secret);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, jwtConfig.refreshSecret);
  }

  async register({ name, email, password, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const user = await User.create({ name, email, password, role });
    const tokens = this.generateTokens(user._id, user.role);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, ...tokens };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = this.generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, ...tokens };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token required');
    }

    const decoded = this.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const tokens = this.generateTokens(user._id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, ...tokens };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }
}

module.exports = new AuthService();
